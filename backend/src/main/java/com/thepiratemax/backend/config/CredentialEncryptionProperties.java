package com.thepiratemax.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.credentials.encryption")
public record CredentialEncryptionProperties(
        String secret,
        String keyVersion
) {
}
