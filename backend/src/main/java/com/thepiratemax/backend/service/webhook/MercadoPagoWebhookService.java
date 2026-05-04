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
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
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
        process(payload, rawPayload, null, null, null);
    }

    @Transactional
    public void process(JsonNode payload, String rawPayload, String queryDataId, String requestId, String signatureHeader) {
        String eventType = textValue(payload, "action", "type");
        String providerEventId = firstNonBlank(queryDataId, textValue(payload.path("data"), "id"));
        String externalReference = textValue(payload.path("data"), "external_reference");
        String providerStatus = textValue(payload.path("data"), "status");
        JsonNode providerPayload = payload;

        boolean signatureValid = validateSignature(providerEventId, queryDataId, requestId, signatureHeader);
        if (mercadoPagoProperties.usesRealGateway() && providerEventId != null && providerEventId.startsWith("dev-")) {
            throw new InvalidRequestException("INVALID_WEBHOOK", "Development webhook payload is not accepted with real Mercado Pago gateway");
        }

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
        webhookEvent.setSignatureValid(signatureValid);
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

    private boolean validateSignature(String providerEventId, String queryDataId, String requestId, String signatureHeader) {
        if (!mercadoPagoProperties.usesRealGateway()) {
            return true;
        }

        String webhookSecret = mercadoPagoProperties.webhookSecret();
        if (webhookSecret == null || webhookSecret.isBlank()) {
            throw new InvalidRequestException("MERCADO_PAGO_WEBHOOK_SECRET_REQUIRED", "Mercado Pago webhook secret is required for real webhooks");
        }

        Map<String, String> signatureParts = parseSignatureHeader(signatureHeader);
        String timestamp = signatureParts.get("ts");
        String receivedHash = signatureParts.get("v1");
        String dataIdForSignature = firstNonBlank(queryDataId, providerEventId);

        if (dataIdForSignature == null || requestId == null || requestId.isBlank() || timestamp == null || receivedHash == null) {
            throw new InvalidRequestException("INVALID_WEBHOOK_SIGNATURE", "Missing Mercado Pago webhook signature data");
        }

        String manifest = "id:%s;request-id:%s;ts:%s;"
                .formatted(dataIdForSignature.toLowerCase(Locale.ROOT), requestId, timestamp);
        String expectedHash = hmacSha256Hex(webhookSecret, manifest);
        if (!MessageDigest.isEqual(
                expectedHash.getBytes(StandardCharsets.UTF_8),
                receivedHash.toLowerCase(Locale.ROOT).getBytes(StandardCharsets.UTF_8)
        )) {
            logger.warn("event=mercado_pago_webhook_signature_invalid providerEventId={} requestId={}", providerEventId, requestId);
            throw new InvalidRequestException("INVALID_WEBHOOK_SIGNATURE", "Invalid Mercado Pago webhook signature");
        }

        return true;
    }

    private Map<String, String> parseSignatureHeader(String signatureHeader) {
        Map<String, String> values = new HashMap<>();
        if (signatureHeader == null || signatureHeader.isBlank()) {
            return values;
        }

        for (String part : signatureHeader.split(",")) {
            String[] keyValue = part.split("=", 2);
            if (keyValue.length == 2 && !keyValue[0].isBlank() && !keyValue[1].isBlank()) {
                values.put(keyValue[0].trim(), keyValue[1].trim());
            }
        }
        return values;
    }

    private String hmacSha256Hex(String secret, String manifest) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(manifest.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(digest.length * 2);
            for (byte value : digest) {
                hex.append(String.format("%02x", value));
            }
            return hex.toString();
        } catch (Exception exception) {
            throw new InvalidRequestException("INVALID_WEBHOOK_SIGNATURE", "Could not validate Mercado Pago webhook signature");
        }
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
