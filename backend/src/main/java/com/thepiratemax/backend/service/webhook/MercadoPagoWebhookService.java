package com.thepiratemax.backend.service.webhook;

import com.fasterxml.jackson.databind.JsonNode;
import com.thepiratemax.backend.config.MercadoPagoProperties;
import com.thepiratemax.backend.domain.order.OrderEntity;
import com.thepiratemax.backend.domain.payment.PaymentEntity;
import com.thepiratemax.backend.domain.webhook.WebhookEventEntity;
import com.thepiratemax.backend.repository.PaymentRepository;
import com.thepiratemax.backend.repository.WebhookEventRepository;
import com.thepiratemax.backend.service.exception.InvalidRequestException;
import com.thepiratemax.backend.service.order.OrderStateService;
import java.time.OffsetDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

@Service
public class MercadoPagoWebhookService {

    private static final String PROVIDER = "MERCADO_PAGO";
    private static final Logger logger = LoggerFactory.getLogger(MercadoPagoWebhookService.class);

    private final PaymentRepository paymentRepository;
    private final WebhookEventRepository webhookEventRepository;
    private final OrderStateService orderStateService;
    private final MercadoPagoProperties mercadoPagoProperties;

    public MercadoPagoWebhookService(
            PaymentRepository paymentRepository,
            WebhookEventRepository webhookEventRepository,
            OrderStateService orderStateService,
            MercadoPagoProperties mercadoPagoProperties
    ) {
        this.paymentRepository = paymentRepository;
        this.webhookEventRepository = webhookEventRepository;
        this.orderStateService = orderStateService;
        this.mercadoPagoProperties = mercadoPagoProperties;
    }

    @Transactional
    public void process(JsonNode payload, String rawPayload) {
        String eventType = textValue(payload, "action", "type");
        String providerEventId = textValue(payload.path("data"), "id");
        String externalReference = textValue(payload.path("data"), "external_reference");
        String providerStatus = textValue(payload.path("data"), "status");
        JsonNode providerPayload = payload;

        if (providerEventId != null && (externalReference == null || providerStatus == null) && mercadoPagoProperties.usesRealGateway()) {
            providerPayload = fetchProviderOrder(providerEventId);
            externalReference = firstNonBlank(externalReference, textValue(providerPayload, "external_reference"));
            JsonNode paymentNode = firstPayment(providerPayload);
            providerStatus = firstNonBlank(providerStatus, textValue(paymentNode, "status"));
        }

        if (providerEventId == null || externalReference == null || providerStatus == null) {
            throw new InvalidRequestException("INVALID_WEBHOOK", "Missing required Mercado Pago webhook fields");
        }

        WebhookEventEntity webhookEvent = webhookEventRepository
                .findByProviderAndProviderEventId(PROVIDER, providerEventId)
                .orElseGet(WebhookEventEntity::new);

        webhookEvent.setProvider(PROVIDER);
        webhookEvent.setEventType(eventType);
        webhookEvent.setProviderEventId(providerEventId);
        webhookEvent.setSignatureValid(true);
        webhookEvent.setPayload(rawPayload);

        String resolvedExternalReference = externalReference;
        PaymentEntity payment = paymentRepository.findByOrder_ExternalReference(resolvedExternalReference)
                .orElseThrow(() -> new InvalidRequestException(
                        "INVALID_WEBHOOK",
                        "Order payment not found for external reference: " + resolvedExternalReference
                ));

        if (webhookEvent.isProcessed() && !shouldReprocessProcessedEvent(payment, providerStatus)) {
            logger.info("event=webhook_duplicate provider={} providerEventId={} externalReference={} providerStatus={}",
                    PROVIDER, providerEventId, externalReference, providerStatus);
            webhookEventRepository.save(webhookEvent);
            return;
        }

        if (webhookEvent.isProcessed()) {
            logger.info("event=webhook_status_reprocessed provider={} providerEventId={} externalReference={} providerStatus={}",
                    PROVIDER, providerEventId, externalReference, providerStatus);
        }

        if (payment.getProviderPaymentId() == null || payment.getProviderPaymentId().isBlank()) {
            payment.setProviderPaymentId(providerEventId);
        }
        payment.setProviderStatus(providerStatus);
        payment.setProviderPayload(providerPayload.toString());

        if (isApproved(providerStatus) && payment.getPaidAt() == null) {
            OffsetDateTime now = OffsetDateTime.now();
            payment.setPaidAt(now);

            OrderEntity order = payment.getOrder();
            orderStateService.markPaidFromWebhook(order, now);
            logger.info("event=payment_approved provider={} providerEventId={} orderId={} externalReference={} orderStatus={} failureReason={}",
                    PROVIDER, providerEventId, order.getId(), order.getExternalReference(), order.getStatus().name(), order.getFailureReason());
        }

        webhookEvent.setProcessed(true);
        webhookEvent.setProcessedAt(OffsetDateTime.now());

        paymentRepository.save(payment);
        webhookEventRepository.save(webhookEvent);
    }

    private boolean isApproved(String providerStatus) {
        return "approved".equalsIgnoreCase(providerStatus) || "processed".equalsIgnoreCase(providerStatus);
    }

    private boolean shouldReprocessProcessedEvent(PaymentEntity payment, String providerStatus) {
        return isApproved(providerStatus) && payment.getPaidAt() == null;
    }

    private JsonNode fetchProviderOrder(String providerEventId) {
        if (mercadoPagoProperties.accessToken() == null || mercadoPagoProperties.accessToken().isBlank()) {
            throw new InvalidRequestException("MERCADO_PAGO_NOT_CONFIGURED", "Mercado Pago access token is required to process real webhooks");
        }

        try {
            JsonNode response = RestClient.builder()
                    .baseUrl(mercadoPagoProperties.baseUrl())
                    .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + mercadoPagoProperties.accessToken())
                    .build()
                    .get()
                    .uri("/v1/orders/{id}", providerEventId)
                    .retrieve()
                    .body(JsonNode.class);
            if (response == null) {
                throw new InvalidRequestException("MERCADO_PAGO_EMPTY_RESPONSE", "Mercado Pago returned an empty order response");
            }
            return response;
        } catch (RestClientResponseException exception) {
            logger.warn("event=mercado_pago_webhook_lookup_failed providerEventId={} statusCode={} body={}",
                    providerEventId, exception.getStatusCode().value(), exception.getResponseBodyAsString());
            throw new InvalidRequestException("MERCADO_PAGO_WEBHOOK_LOOKUP_FAILED", "Could not fetch Mercado Pago order for webhook");
        } catch (RestClientException exception) {
            logger.warn("event=mercado_pago_webhook_lookup_unavailable providerEventId={} message={}",
                    providerEventId, exception.getMessage());
            throw new InvalidRequestException("MERCADO_PAGO_UNAVAILABLE", "Mercado Pago could not be reached while processing webhook");
        }
    }

    private JsonNode firstPayment(JsonNode response) {
        JsonNode payments = response.path("transactions").path("payments");
        if (payments.isArray() && !payments.isEmpty()) {
            return payments.get(0);
        }
        return response.path("payment");
    }

    private String firstNonBlank(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first;
        }
        return second;
    }

    private String textValue(JsonNode node, String... fields) {
        for (String field : fields) {
            JsonNode value = node.path(field);
            if (!value.isMissingNode() && !value.isNull() && !value.asText().isBlank()) {
                return value.asText();
            }
        }
        return null;
    }
}
