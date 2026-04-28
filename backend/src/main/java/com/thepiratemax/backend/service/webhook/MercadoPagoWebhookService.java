package com.thepiratemax.backend.service.webhook;

import com.fasterxml.jackson.databind.JsonNode;
import com.thepiratemax.backend.domain.order.OrderEntity;
import com.thepiratemax.backend.domain.order.OrderStatus;
import com.thepiratemax.backend.domain.payment.PaymentEntity;
import com.thepiratemax.backend.domain.webhook.WebhookEventEntity;
import com.thepiratemax.backend.repository.PaymentRepository;
import com.thepiratemax.backend.repository.WebhookEventRepository;
import com.thepiratemax.backend.service.exception.InvalidRequestException;
import java.time.OffsetDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MercadoPagoWebhookService {

    private static final String PROVIDER = "MERCADO_PAGO";

    private final PaymentRepository paymentRepository;
    private final WebhookEventRepository webhookEventRepository;

    public MercadoPagoWebhookService(
            PaymentRepository paymentRepository,
            WebhookEventRepository webhookEventRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.webhookEventRepository = webhookEventRepository;
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
            order.setPaidAt(now);
            if (order.getStatus() == OrderStatus.PENDING) {
                order.setStatus(OrderStatus.PAID);
            }
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
