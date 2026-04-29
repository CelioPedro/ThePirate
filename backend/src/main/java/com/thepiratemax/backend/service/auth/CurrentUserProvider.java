package com.thepiratemax.backend.service.auth;

import com.thepiratemax.backend.config.AuthProperties;
import com.thepiratemax.backend.config.DevUserProperties;
import com.thepiratemax.backend.domain.user.UserEntity;
import com.thepiratemax.backend.repository.UserRepository;
import com.thepiratemax.backend.service.exception.AccessDeniedException;
import com.thepiratemax.backend.service.exception.NotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserProvider {

    private final UserRepository userRepository;
    private final DevUserProperties devUserProperties;
    private final AuthProperties authProperties;

    public CurrentUserProvider(UserRepository userRepository, DevUserProperties devUserProperties, AuthProperties authProperties) {
        this.userRepository = userRepository;
        this.devUserProperties = devUserProperties;
        this.authProperties = authProperties;
    }

    public UserEntity getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && authentication.getName() != null
                && !"anonymousUser".equals(authentication.getName())) {
            return userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "Authenticated user not found"));
        }

        if (!authProperties.enabled()) {
            return userRepository.findByEmail(devUserProperties.defaultUserEmail())
                    .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "Default development user not found"));
        }

        throw new AccessDeniedException("UNAUTHENTICATED", "Authentication is required");
    }
}
