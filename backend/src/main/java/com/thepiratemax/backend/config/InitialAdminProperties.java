package com.thepiratemax.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.initial-admin")
public record InitialAdminProperties(
        boolean enabled,
        String email,
        String password,
        String name
) {
}
