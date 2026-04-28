package com.thepiratemax.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.integrations.mercado-pago")
public record MercadoPagoProperties(
        String accessToken,
        String webhookSecret,
        String baseUrl
) {
}

