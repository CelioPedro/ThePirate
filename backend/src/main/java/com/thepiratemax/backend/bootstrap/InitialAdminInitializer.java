package com.thepiratemax.backend.bootstrap;

import com.thepiratemax.backend.config.InitialAdminProperties;
import com.thepiratemax.backend.domain.user.UserEntity;
import com.thepiratemax.backend.domain.user.UserRole;
import com.thepiratemax.backend.domain.user.UserStatus;
import com.thepiratemax.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.support.TransactionTemplate;

@Configuration
public class InitialAdminInitializer {

    private static final Logger logger = LoggerFactory.getLogger(InitialAdminInitializer.class);

    @Bean
    CommandLineRunner seedInitialAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            InitialAdminProperties initialAdminProperties,
            TransactionTemplate transactionTemplate
    ) {
        return args -> transactionTemplate.executeWithoutResult(status ->
                createInitialAdminIfNeeded(userRepository, passwordEncoder, initialAdminProperties));
    }

    void createInitialAdminIfNeeded(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            InitialAdminProperties properties
    ) {
        if (!properties.enabled()) {
            return;
        }

        if (userRepository.existsByRole(UserRole.ADMIN)) {
            logger.info("event=initial_admin_skipped reason=admin_already_exists");
            return;
        }

        String email = require("INITIAL_ADMIN_EMAIL", properties.email()).trim().toLowerCase();
        String password = require("INITIAL_ADMIN_PASSWORD", properties.password());
        String name = normalizeName(properties.name());

        if (password.length() < 12) {
            throw new IllegalStateException("INITIAL_ADMIN_PASSWORD must have at least 12 characters");
        }

        if (userRepository.existsByEmail(email)) {
            throw new IllegalStateException("INITIAL_ADMIN_EMAIL already exists with a non-admin role");
        }

        UserEntity admin = new UserEntity();
        admin.setEmail(email);
        admin.setName(name);
        admin.setRole(UserRole.ADMIN);
        admin.setStatus(UserStatus.ACTIVE);
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin = userRepository.save(admin);

        logger.info("event=initial_admin_created userId={} email={}", admin.getId(), admin.getEmail());
    }

    private String require(String variableName, String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(variableName + " is required when INITIAL_ADMIN_ENABLED=true");
        }
        return value;
    }

    private String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            return "Admin";
        }
        return name.trim();
    }
}
