package com.thepiratemax.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thepiratemax.backend.api.ApiError;
import com.thepiratemax.backend.config.RateLimitProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitFilter.class);

    private final RateLimitProperties properties;
    private final ObjectMapper objectMapper;
    private final Clock clock;
    private final Map<String, WindowCounter> counters = new ConcurrentHashMap<>();

    @Autowired
    public RateLimitFilter(RateLimitProperties properties, ObjectMapper objectMapper) {
        this(properties, objectMapper, Clock.systemUTC());
    }

    RateLimitFilter(RateLimitProperties properties, ObjectMapper objectMapper, Clock clock) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.clock = clock;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        LimitRule rule = ruleFor(request);
        if (!properties.enabled() || rule == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientKey = rule.name() + ":" + clientIp(request);
        long currentWindow = clock.millis() / 60_000;
        WindowCounter counter = counters.compute(clientKey, (key, existing) -> {
            if (existing == null || existing.window() != currentWindow) {
                return new WindowCounter(currentWindow, 1);
            }
            return new WindowCounter(currentWindow, existing.count() + 1);
        });

        if (counter.count() > rule.maxRequests()) {
            logger.warn("event=rate_limit_exceeded rule={} path={} method={} clientIp={}",
                    rule.name(), request.getRequestURI(), request.getMethod(), clientIp(request));
            response.setStatus(429);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            objectMapper.writeValue(response.getWriter(),
                    ApiError.of("RATE_LIMIT_EXCEEDED", "Too many requests. Try again in a moment."));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private LimitRule ruleFor(HttpServletRequest request) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return null;
        }

        String path = request.getRequestURI();
        if ("/api/auth/login".equals(path)) {
            return new LimitRule("auth-login", properties.loginPerMinute());
        }
        if ("/api/auth/register".equals(path)) {
            return new LimitRule("auth-register", properties.registerPerMinute());
        }
        if ("/api/auth/password-reset/request".equals(path)) {
            return new LimitRule("password-reset", properties.passwordResetPerMinute());
        }
        if ("/api/orders".equals(path)) {
            return new LimitRule("checkout", properties.checkoutPerMinute());
        }
        return null;
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private record WindowCounter(long window, int count) {
    }

    private record LimitRule(String name, int maxRequests) {
    }
}
