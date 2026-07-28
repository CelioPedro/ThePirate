package com.thepiratemax.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security.rate-limit")
public record RateLimitProperties(
        boolean enabled,
        int loginPerMinute,
        int registerPerMinute,
        int passwordResetPerMinute,
        int checkoutPerMinute
) {
}
