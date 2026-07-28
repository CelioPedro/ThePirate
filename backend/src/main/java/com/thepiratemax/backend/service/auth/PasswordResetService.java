package com.thepiratemax.backend.service.auth;

import com.thepiratemax.backend.api.auth.PasswordResetConfirmRequest;
import com.thepiratemax.backend.api.auth.PasswordResetRequest;
import com.thepiratemax.backend.api.auth.PasswordResetResponse;
import com.thepiratemax.backend.config.PasswordResetProperties;
import com.thepiratemax.backend.domain.auth.PasswordResetTokenEntity;
import com.thepiratemax.backend.domain.user.UserEntity;
import com.thepiratemax.backend.domain.user.UserStatus;
import com.thepiratemax.backend.repository.PasswordResetTokenRepository;
import com.thepiratemax.backend.repository.UserRepository;
import com.thepiratemax.backend.service.exception.InvalidRequestException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PasswordResetService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetProperties properties;

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            PasswordResetProperties properties
    ) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
    }

    @Transactional
    public PasswordResetResponse requestReset(PasswordResetRequest request, String requestedIp) {
        String normalizedEmail = request.email().trim().toLowerCase();
        Instant expiresAt = Instant.now().plus(properties.expirationMinutes(), ChronoUnit.MINUTES);

        return userRepository.findByEmail(normalizedEmail)
                .filter(user -> user.getStatus() == UserStatus.ACTIVE)
                .map(user -> createToken(user, requestedIp, expiresAt))
                .orElseGet(() -> {
                    logger.info("event=password_reset_requested emailPresent={} userFound=false", !normalizedEmail.isBlank());
                    return new PasswordResetResponse("If the email exists, a reset instruction will be issued.", null, null);
                });
    }

    @Transactional
    public void confirmReset(PasswordResetConfirmRequest request) {
        String tokenHash = hashToken(request.token().trim());
        PasswordResetTokenEntity resetToken = tokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidRequestException("PASSWORD_RESET_INVALID", "Password reset token is invalid or expired"));

        Instant now = Instant.now();
        if (resetToken.getUsedAt() != null || resetToken.getExpiresAt().isBefore(now)) {
            throw new InvalidRequestException("PASSWORD_RESET_INVALID", "Password reset token is invalid or expired");
        }

        UserEntity user = resetToken.getUser();
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new InvalidRequestException("PASSWORD_RESET_INVALID", "Password reset token is invalid or expired");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        resetToken.setUsedAt(now);
        tokenRepository.markOpenTokensUsed(user.getId(), now);
        logger.info("event=password_reset_completed userId={} email={}", user.getId(), user.getEmail());
    }

    private PasswordResetResponse createToken(UserEntity user, String requestedIp, Instant expiresAt) {
        String rawToken = generateToken();
        PasswordResetTokenEntity resetToken = new PasswordResetTokenEntity();
        resetToken.setUser(user);
        resetToken.setTokenHash(hashToken(rawToken));
        resetToken.setExpiresAt(expiresAt);
        resetToken.setRequestedIp(requestedIp);
        tokenRepository.save(resetToken);

        logger.info("event=password_reset_requested userId={} email={} expiresAt={}",
                user.getId(), user.getEmail(), expiresAt);
        return new PasswordResetResponse(
                "If the email exists, a reset instruction will be issued.",
                expiresAt,
                properties.exposeTokenInResponse() ? rawToken : null
        );
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }
}
