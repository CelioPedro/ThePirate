package com.thepiratemax.backend.service.payment;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thepiratemax.backend.config.MercadoPagoProperties;
import com.thepiratemax.backend.domain.order.OrderEntity;
import com.thepiratemax.backend.service.exception.InvalidRequestException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

@Component
@ConditionalOnProperty(prefix = "app.integrations.mercado-pago", name = "gateway", havingValue = "real")
public class MercadoPagoPixPaymentGateway implements PixPaymentGateway {

    private static final Logger logger = LoggerFactory.getLogger(MercadoPagoPixPaymentGateway.class);

    private final MercadoPagoProperties properties;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public MercadoPagoPixPaymentGateway(MercadoPagoProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl(properties.baseUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.accessToken())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Override
    public PixPaymentDetails createPixPayment(OrderEntity order) {
        if (properties.accessToken() == null || properties.accessToken().isBlank()) {
            throw new InvalidRequestException("MERCADO_PAGO_NOT_CONFIGURED", "Mercado Pago access token is required for real payments");
        }

        OffsetDateTime expiresAt = OffsetDateTime.now().plusMinutes(properties.pixExpirationMinutes());
        Map<String, Object> request = buildRequest(order, expiresAt);

        try {
            JsonNode response = restClient.post()
                    .uri("/v1/orders")
                    .header("X-Idempotency-Key", order.getExternalReference())
                    .body(request)
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null) {
                throw new InvalidRequestException("MERCADO_PAGO_EMPTY_RESPONSE", "Mercado Pago returned an empty response");
            }

            String providerId = firstText(response, "id", "order_id");
            JsonNode payment = firstPayment(response);
            String paymentId = firstText(payment, "id", "payment_id");
            String providerStatus = firstText(payment, "status", "status_detail");
            JsonNode transactionData = payment.path("payment_method");
            JsonNode paymentMethodData = transactionData.path("data");
            if (!paymentMethodData.isMissingNode() && !paymentMethodData.isNull() && paymentMethodData.isObject()) {
                transactionData = paymentMethodData;
            }
            if (transactionData.isMissingNode() || transactionData.isNull()) {
                transactionData = payment.path("transaction_data");
            }

            String qrCode = firstText(transactionData, "qr_code_base64", "qr_code");
            String copyPaste = firstText(transactionData, "qr_code", "ticket_url");

            if (copyPaste == null || copyPaste.isBlank()) {
                throw new InvalidRequestException("MERCADO_PAGO_PIX_NOT_RETURNED", "Mercado Pago response did not include Pix copy-and-paste data");
            }

            logger.info("event=mercado_pago_pix_created orderId={} externalReference={} providerOrderId={} providerPaymentId={} status={}",
                    order.getId(), order.getExternalReference(), providerId, paymentId, providerStatus);

            return new PixPaymentDetails(
                    paymentId != null ? paymentId : providerId,
                    qrCode,
                    copyPaste,
                    expiresAt,
                    providerStatus != null ? providerStatus : "pending",
                    objectMapper.writeValueAsString(response)
            );
        } catch (RestClientResponseException exception) {
            logger.warn("event=mercado_pago_pix_failed orderId={} externalReference={} statusCode={} body={}",
                    order.getId(), order.getExternalReference(), exception.getStatusCode().value(), exception.getResponseBodyAsString());
            throw new InvalidRequestException("MERCADO_PAGO_REQUEST_FAILED", "Mercado Pago rejected the Pix creation request");
        } catch (RestClientException exception) {
            logger.warn("event=mercado_pago_pix_unavailable orderId={} externalReference={} message={}",
                    order.getId(), order.getExternalReference(), exception.getMessage());
            throw new InvalidRequestException("MERCADO_PAGO_UNAVAILABLE", "Mercado Pago could not be reached");
        } catch (JsonProcessingException exception) {
            throw new InvalidRequestException("MERCADO_PAGO_RESPONSE_INVALID", "Mercado Pago response could not be stored");
        }
    }

    private Map<String, Object> buildRequest(OrderEntity order, OffsetDateTime expiresAt) {
        Map<String, Object> paymentMethod = new LinkedHashMap<>();
        paymentMethod.put("id", "pix");
        paymentMethod.put("type", "bank_transfer");

        Map<String, Object> payment = new LinkedHashMap<>();
        payment.put("amount", money(order.getTotalCents()));
        payment.put("payment_method", paymentMethod);

        Map<String, Object> transactions = new LinkedHashMap<>();
        transactions.put("payments", List.of(payment));

        Map<String, Object> request = new LinkedHashMap<>();
        request.put("type", "online");
        request.put("external_reference", order.getExternalReference());
        request.put("total_amount", money(order.getTotalCents()));
        request.put("payer", buildPayer(order));
        request.put("transactions", transactions);

        return request;
    }

    private Map<String, Object> buildPayer(OrderEntity order) {
        String configuredEmail = properties.payerEmail();
        String email = configuredEmail != null && !configuredEmail.isBlank()
                ? configuredEmail
                : order.getUser().getEmail();

        String configuredFirstName = properties.payerFirstName();
        String firstName = configuredFirstName != null && !configuredFirstName.isBlank()
                ? configuredFirstName
                : firstNameFrom(order.getUser().getName());

        Map<String, Object> payer = new LinkedHashMap<>();
        payer.put("email", email);
        payer.put("first_name", firstName);
        return payer;
    }

    private String firstNameFrom(String name) {
        if (name == null || name.isBlank()) {
            return "Cliente";
        }
        return name.trim().split("\\s+")[0];
    }

    private String money(long cents) {
        return BigDecimal.valueOf(cents, 2).setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private JsonNode firstPayment(JsonNode response) {
        JsonNode payments = response.path("transactions").path("payments");
        if (payments.isArray() && !payments.isEmpty()) {
            return payments.get(0);
        }
        return response.path("payment");
    }

    private String firstText(JsonNode node, String... fields) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }
        for (String field : fields) {
            JsonNode value = node.path(field);
            if (!value.isMissingNode() && !value.isNull() && !value.asText().isBlank()) {
                return value.asText();
            }
        }
        return null;
    }
}
