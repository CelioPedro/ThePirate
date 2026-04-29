package com.thepiratemax.backend.service.auth;

import com.thepiratemax.backend.api.auth.AuthResponse;
import com.thepiratemax.backend.api.auth.LoginRequest;
import com.thepiratemax.backend.api.auth.RegisterRequest;
import com.thepiratemax.backend.domain.user.UserEntity;
import com.thepiratemax.backend.domain.user.UserRole;
import com.thepiratemax.backend.domain.user.UserStatus;
import com.thepiratemax.backend.repository.UserRepository;
import com.thepiratemax.backend.security.JwtService;
import com.thepiratemax.backend.service.exception.ConflictException;
import com.thepiratemax.backend.service.exception.UnauthorizedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CurrentUserProvider currentUserProvider;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            CurrentUserProvider currentUserProvider
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ConflictException("EMAIL_ALREADY_REGISTERED", "Email is already registered");
        }

        UserEntity user = new UserEntity();
        user.setEmail(normalizedEmail);
        user.setName(request.name().trim());
        user.setStatus(UserStatus.ACTIVE);
        user.setRole(UserRole.CUSTOMER);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user = userRepository.save(user);

        JwtService.TokenPayload tokenPayload = jwtService.generateToken(user);
        logger.info("event=user_registered userId={} email={} role={}", user.getId(), user.getEmail(), user.getRole().name());
        return toAuthResponse(user, tokenPayload);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        UserEntity user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("INVALID_CREDENTIALS", "Invalid email or password"));

        if (user.getStatus() != UserStatus.ACTIVE || user.getPasswordHash() == null
                || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("INVALID_CREDENTIALS", "Invalid email or password");
        }

        JwtService.TokenPayload tokenPayload = jwtService.generateToken(user);
        logger.info("event=user_login_success userId={} email={} role={}", user.getId(), user.getEmail(), user.getRole().name());
        return toAuthResponse(user, tokenPayload);
    }

    @Transactional(readOnly = true)
    public AuthResponse.UserResponse me() {
        UserEntity user = currentUserProvider.getCurrentUser();
        return new AuthResponse.UserResponse(user.getId(), user.getEmail(), user.getName(), user.getRole().name());
    }

    private AuthResponse toAuthResponse(UserEntity user, JwtService.TokenPayload tokenPayload) {
        return new AuthResponse(
                tokenPayload.token(),
                tokenPayload.expiresAt(),
                new AuthResponse.UserResponse(user.getId(), user.getEmail(), user.getName(), user.getRole().name())
        );
    }
}
