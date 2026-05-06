package com.thepiratemax.backend.service.payment;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import com.thepiratemax.backend.config.MercadoPagoProperties;
import com.thepiratemax.backend.domain.order.OrderEntity;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

class MercadoPagoPixPaymentGatewayTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private HttpServer server;

    @AfterEach
    void tearDown() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void createsPixPaymentUsingMercadoPagoOrdersApi() throws Exception {
        AtomicReference<String> authorization = new AtomicReference<>();
        AtomicReference<String> idempotencyKey = new AtomicReference<>();
        AtomicReference<JsonNode> requestBody = new AtomicReference<>();
        server = startServer(authorization, idempotencyKey, requestBody);

        MercadoPagoProperties properties = new MercadoPagoProperties(
                "real",
                "test-access-token",
                "test-secret",
                true,
                "http://127.0.0.1:" + server.getAddress().getPort(),
                "https://thepiratemax.test/api/webhooks/mercadopago",
                30,
                "test@testuser.com",
                "APRO"
        );
        MercadoPagoPixPaymentGateway gateway = new MercadoPagoPixPaymentGateway(properties, objectMapper);

        OrderEntity order = new OrderEntity();
        order.setExternalReference("TPM-REAL-PIX-001");
        order.setTotalCents(999);
        order.setCurrency("BRL");

        PixPaymentDetails details = gateway.createPixPayment(order);

        assertThat(authorization.get()).isEqualTo("Bearer test-access-token");
        assertThat(idempotencyKey.get()).isEqualTo("TPM-REAL-PIX-001");
        assertThat(requestBody.get().path("type").asText()).isEqualTo("online");
        assertThat(requestBody.get().path("external_reference").asText()).isEqualTo("TPM-REAL-PIX-001");
        assertThat(requestBody.get().path("total_amount").asText()).isEqualTo("9.99");
        assertThat(requestBody.get().path("payer").path("email").asText()).isEqualTo("test@testuser.com");
        assertThat(requestBody.get().path("payer").path("first_name").asText()).isEqualTo("APRO");
        assertThat(requestBody.get().path("transactions").path("payments").get(0).path("payment_method").path("id").asText()).isEqualTo("pix");
        assertThat(requestBody.get().has("notification_url")).isFalse();
        assertThat(requestBody.get().path("transactions").path("payments").get(0).has("expiration_time")).isFalse();
        assertThat(details.providerPaymentId()).isEqualTo("pay-123");
        assertThat(details.copyPaste()).isEqualTo("000201PIXREAL");
        assertThat(details.qrCode()).isEqualTo("base64-qr");
        assertThat(details.providerStatus()).isEqualTo("pending");
        assertThat(details.providerPayload()).contains("order-123");
    }

    private HttpServer startServer(
            AtomicReference<String> authorization,
            AtomicReference<String> idempotencyKey,
            AtomicReference<JsonNode> requestBody
    ) throws IOException {
        HttpServer httpServer = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        httpServer.createContext("/v1/orders", exchange -> {
            authorization.set(exchange.getRequestHeaders().getFirst("Authorization"));
            idempotencyKey.set(exchange.getRequestHeaders().getFirst("X-Idempotency-Key"));
            requestBody.set(objectMapper.readTree(exchange.getRequestBody()));

            String response = """
                    {
                      "id": "order-123",
                      "transactions": {
                        "payments": [
                          {
                            "id": "pay-123",
                            "status": "pending",
                            "payment_method": {
                              "data": {
                                "qr_code": "000201PIXREAL",
                                "qr_code_base64": "base64-qr"
                              }
                            }
                          }
                        ]
                      }
                    }
                    """;
            byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(201, bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.close();
        });
        httpServer.start();
        return httpServer;
    }
}
