package com.thepiratemax.backend.service.webhook;

import com.fasterxml.jackson.databind.JsonNode;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MercadoPagoWebhookService {

    private static final String PROVIDER = "MERCADO_PAGO";
    private static final Logger logger = LoggerFactory.getLogger(MercadoPagoWebhookService.class);

    private final PaymentRepository paymentRepository;
    private final WebhookEventRepository webhookEventRepository;
    private final OrderStateService orderStateService;

    public MercadoPagoWebhookService(
            PaymentRepository paymentRepository,
            WebhookEventRepository webhookEventRepository,
            OrderStateService orderStateService
    ) {
        this.paymentRepository = paymentRepository;
        this.webhookEventRepository = webhookEventRepository;
        this.orderStateService = orderStateService;
    }

    @Transactional
    public void process(JsonNode payload, String rawPayload) {
        String eventType = textValue(payload, "action", "type");
        String providerEventId = textValue(payload.path("data"), "id");
        String externalReference = textValue(payload.path("data"), "external_reference");
        String providerStatus = textValue(payload.path("data"), "status");

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

        if (webhookEvent.isProcessed()) {
            logger.info("event=webhook_duplicate provider={} providerEventId={} externalReference={}", PROVIDER, providerEventId, externalReference);
            webhookEventRepository.save(webhookEvent);
            return;
        }

        PaymentEntity payment = paymentRepository.findByOrder_ExternalReference(externalReference)
                .orElseThrow(() -> new InvalidRequestException(
                        "INVALID_WEBHOOK",
                        "Order payment not found for external reference: " + externalReference
                ));

        payment.setProviderPaymentId(providerEventId);
        payment.setProviderStatus(providerStatus);
        payment.setProviderPayload(rawPayload);

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
        return "approved".equalsIgnoreCase(providerStatus);
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
