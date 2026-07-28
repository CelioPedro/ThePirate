package com.thepiratemax.backend.bootstrap;

import com.thepiratemax.backend.config.AuthProperties;
import com.thepiratemax.backend.config.CorsProperties;
import com.thepiratemax.backend.config.CredentialEncryptionProperties;
import com.thepiratemax.backend.config.JwtProperties;
import com.thepiratemax.backend.config.MercadoPagoProperties;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("production")
public class ProductionSafetyValidator {

    private static final String LOCAL_JWT_SECRET = "the-pirate-max-local-jwt-secret-2026-very-strong-key";
    private static final String LOCAL_CREDENTIAL_SECRET = "the-pirate-max-local-credential-secret-2026";

    @Bean
    CommandLineRunner validateProductionConfiguration(
            AuthProperties authProperties,
            JwtProperties jwtProperties,
            CredentialEncryptionProperties credentialEncryptionProperties,
            CorsProperties corsProperties,
            MercadoPagoProperties mercadoPagoProperties
    ) {
        return args -> {
            require(authProperties.enabled(), "AUTH_ENABLED must be true in production");
            requireStrongSecret(jwtProperties.secret(), "AUTH_JWT_SECRET", LOCAL_JWT_SECRET);
            requireStrongSecret(credentialEncryptionProperties.secret(), "CREDENTIAL_ENCRYPTION_SECRET", LOCAL_CREDENTIAL_SECRET);
            requireRestrictedCors(corsProperties.allowedOriginPatterns());
            require(mercadoPagoProperties.usesRealGateway(), "Mercado Pago gateway must be real in production");
            requirePresent(mercadoPagoProperties.accessToken(), "MERCADO_PAGO_ACCESS_TOKEN");
            requirePresent(mercadoPagoProperties.webhookSecret(), "MERCADO_PAGO_WEBHOOK_SECRET");
            require(mercadoPagoProperties.webhookSignatureValidationEnabled(),
                    "MERCADO_PAGO_WEBHOOK_SIGNATURE_VALIDATION_ENABLED must be true in production");
            requireHttps(mercadoPagoProperties.notificationUrl(), "MERCADO_PAGO_NOTIFICATION_URL");
        };
    }

    private void requireStrongSecret(String value, String name, String localDefault) {
        requirePresent(value, name);
        require(value.trim().length() >= 32, name + " must have at least 32 characters");
        require(!localDefault.equals(value), name + " must not use the local default value");
    }

    private void requireRestrictedCors(List<String> patterns) {
        require(patterns != null && !patterns.isEmpty(), "CORS_ALLOWED_ORIGIN_PATTERNS is required in production");
        require(patterns.stream().noneMatch(pattern -> pattern == null || pattern.isBlank() || "*".equals(pattern.trim())),
                "CORS_ALLOWED_ORIGIN_PATTERNS must not contain '*' in production");
    }

    private void requirePresent(String value, String name) {
        require(value != null && !value.isBlank(), name + " is required in production");
    }

    private void requireHttps(String value, String name) {
        requirePresent(value, name);
        require(value.trim().startsWith("https://"), name + " must use https in production");
    }

    private void require(boolean condition, String message) {
        if (!condition) {
            throw new IllegalStateException(message);
        }
    }
}
