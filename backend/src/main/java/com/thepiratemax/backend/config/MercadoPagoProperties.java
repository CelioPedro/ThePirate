package com.thepiratemax.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.integrations.mercado-pago")
public record MercadoPagoProperties(
        String gateway,
        String accessToken,
        String webhookSecret,
        String baseUrl,
        String notificationUrl,
        int pixExpirationMinutes,
        String payerEmail,
        String payerFirstName
) {

    public boolean usesRealGateway() {
        return "real".equalsIgnoreCase(gateway);
    }
}
