package com.thepiratemax.backend.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.web.cors")
public record CorsProperties(
        List<String> allowedOriginPatterns
) {
}
