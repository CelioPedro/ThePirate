package com.thepiratemax.backend.api.webhook;

import com.fasterxml.jackson.databind.JsonNode;
import com.thepiratemax.backend.service.webhook.MercadoPagoWebhookService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/webhooks/mercadopago")
public class MercadoPagoWebhookController {

    private final MercadoPagoWebhookService mercadoPagoWebhookService;

    public MercadoPagoWebhookController(MercadoPagoWebhookService mercadoPagoWebhookService) {
        this.mercadoPagoWebhookService = mercadoPagoWebhookService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.OK)
    public WebhookAcknowledgeResponse receive(@RequestBody JsonNode payload) {
        mercadoPagoWebhookService.process(payload, payload.toString());
        return new WebhookAcknowledgeResponse(true);
    }
}
