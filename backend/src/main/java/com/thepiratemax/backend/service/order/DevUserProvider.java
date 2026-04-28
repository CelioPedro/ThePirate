package com.thepiratemax.backend.service.order;

import com.thepiratemax.backend.config.DevUserProperties;
import com.thepiratemax.backend.domain.user.UserEntity;
import com.thepiratemax.backend.repository.UserRepository;
import com.thepiratemax.backend.service.exception.NotFoundException;
import org.springframework.stereotype.Component;

@Component
public class DevUserProvider {

    private final UserRepository userRepository;
    private final DevUserProperties devUserProperties;

    public DevUserProvider(UserRepository userRepository, DevUserProperties devUserProperties) {
        this.userRepository = userRepository;
        this.devUserProperties = devUserProperties;
    }

    public UserEntity getCurrentUser() {
        return userRepository.findByEmail(devUserProperties.defaultUserEmail())
                .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "Default development user not found"));
    }
}

