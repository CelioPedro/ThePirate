package com.thepiratemax.backend.api.webhook;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thepiratemax.backend.service.webhook.MercadoPagoWebhookService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/webhooks/mercadopago")
public class MercadoPagoWebhookController {

    private final MercadoPagoWebhookService mercadoPagoWebhookService;
    private final ObjectMapper objectMapper;

    public MercadoPagoWebhookController(MercadoPagoWebhookService mercadoPagoWebhookService, ObjectMapper objectMapper) {
        this.mercadoPagoWebhookService = mercadoPagoWebhookService;
        this.objectMapper = objectMapper;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.OK)
    public WebhookAcknowledgeResponse receive(
            @RequestBody String rawPayload,
            @RequestParam(name = "data.id", required = false) String dataId,
            @RequestHeader(name = "x-request-id", required = false) String requestId,
            @RequestHeader(name = "x-signature", required = false) String signature
    ) throws JsonProcessingException {
        JsonNode payload = objectMapper.readTree(rawPayload);
        mercadoPagoWebhookService.process(payload, rawPayload, dataId, requestId, signature);
        return new WebhookAcknowledgeResponse(true);
    }
}
