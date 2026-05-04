package com.thepiratemax.backend.service.webhook;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thepiratemax.backend.config.MercadoPagoProperties;
import com.thepiratemax.backend.domain.order.OrderEntity;
import com.thepiratemax.backend.domain.order.OrderStatus;
import com.thepiratemax.backend.domain.order.PaymentMethod;
import com.thepiratemax.backend.domain.payment.PaymentEntity;
import com.thepiratemax.backend.domain.payment.PaymentProvider;
import com.thepiratemax.backend.domain.webhook.WebhookEventEntity;
import com.thepiratemax.backend.repository.PaymentRepository;
import com.thepiratemax.backend.repository.WebhookEventRepository;
import com.thepiratemax.backend.service.exception.InvalidRequestException;
import com.thepiratemax.backend.service.order.OrderStateService;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class MercadoPagoWebhookServiceTest {

    private static final String SECRET = "test-webhook-secret";
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final PaymentRepository paymentRepository = mock(PaymentRepository.class);
    private final WebhookEventRepository webhookEventRepository = mock(WebhookEventRepository.class);
    private final OrderStateService orderStateService = mock(OrderStateService.class);
    private final MercadoPagoWebhookService service = new MercadoPagoWebhookService(
            paymentRepository,
            webhookEventRepository,
            orderStateService,
            new MercadoPagoProperties(
                    "real",
                    "test-token",
                    SECRET,
                    "https://api.mercadopago.com",
                    "https://thepiratemax.test/api/webhooks/mercadopago",
                    30,
                    "buyer@testuser.com",
                    "APRO"
            )
    );

    @Test
    void rejectsDevelopmentWebhookPayloadWhenGatewayIsReal() throws Exception {
        String payload = """
                {
                  "action": "order.updated",
                  "data": {
                    "id": "dev-123",
                    "status": "approved",
                    "external_reference": "TPM-REF-001"
                  }
                }
                """;

        assertThatThrownBy(() -> service.process(
                OBJECT_MAPPER.readTree(payload),
                payload,
                "dev-123",
                "request-001",
                signatureHeader("dev-123", "request-001", "1742505638683")
        ))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("Development webhook payload");
    }

    @Test
    void rejectsRealWebhookWithInvalidSignature() throws Exception {
        String payload = """
                {
                  "action": "order.updated",
                  "data": {
                    "id": "ORDTST01ABC",
                    "status": "approved",
                    "external_reference": "TPM-REF-001"
                  }
                }
                """;

        assertThatThrownBy(() -> service.process(
                OBJECT_MAPPER.readTree(payload),
                payload,
                "ORDTST01ABC",
                "request-001",
                "ts=1742505638683,v1=bad-signature"
        ))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("Invalid Mercado Pago webhook signature");
    }

    @Test
    void acceptsRealWebhookWithValidSignature() throws Exception {
        String payload = """
                {
                  "action": "order.updated",
                  "data": {
                    "id": "ORDTST01ABC",
                    "status": "approved",
                    "external_reference": "TPM-REF-001"
                  }
                }
                """;
        PaymentEntity payment = payment();

        when(webhookEventRepository.findByProviderAndProviderEventId("MERCADO_PAGO", "ORDTST01ABC"))
                .thenReturn(Optional.empty());
        when(paymentRepository.findByOrder_ExternalReference("TPM-REF-001"))
                .thenReturn(Optional.of(payment));

        service.process(
                OBJECT_MAPPER.readTree(payload),
                payload,
                "ORDTST01ABC",
                "request-001",
                signatureHeader("ORDTST01ABC", "request-001", "1742505638683")
        );

        ArgumentCaptor<WebhookEventEntity> webhookEventCaptor = ArgumentCaptor.forClass(WebhookEventEntity.class);
        verify(webhookEventRepository).save(webhookEventCaptor.capture());
        assertThat(webhookEventCaptor.getValue().isSignatureValid()).isTrue();
        assertThat(payment.getProviderStatus()).isEqualTo("approved");
    }

    private PaymentEntity payment() {
        OrderEntity order = new OrderEntity();
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentMethod(PaymentMethod.PIX);
        order.setSubtotalCents(2599L);
        order.setTotalCents(2599L);
        order.setCurrency("BRL");
        order.setExternalReference("TPM-REF-001");

        PaymentEntity payment = new PaymentEntity();
        payment.setOrder(order);
        payment.setProvider(PaymentProvider.MERCADO_PAGO);
        payment.setPaymentMethod(PaymentMethod.PIX);
        payment.setAmountCents(2599L);
        payment.setCurrency("BRL");
        payment.setProviderStatus("action_required");
        return payment;
    }

    private String signatureHeader(String dataId, String requestId, String timestamp) throws Exception {
        String manifest = "id:%s;request-id:%s;ts:%s;"
                .formatted(dataId.toLowerCase(), requestId, timestamp);
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] digest = mac.doFinal(manifest.getBytes(StandardCharsets.UTF_8));
        StringBuilder hex = new StringBuilder(digest.length * 2);
        for (byte value : digest) {
            hex.append(String.format("%02x", value));
        }
        return "ts=%s,v1=%s".formatted(timestamp, hex);
    }
}
