package com.thepiratemax.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.redis")
public record RedisQueueProperties(
        String credentialsDeliveryQueue
) {
}

