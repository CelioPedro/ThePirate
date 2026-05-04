package com.thepiratemax.backend.bootstrap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.thepiratemax.backend.config.InitialAdminProperties;
import com.thepiratemax.backend.domain.user.UserEntity;
import com.thepiratemax.backend.domain.user.UserRole;
import com.thepiratemax.backend.domain.user.UserStatus;
import com.thepiratemax.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:initialadmin;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE")
@ActiveProfiles("test")
class InitialAdminInitializerTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private InitialAdminInitializer initializer;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        initializer = new InitialAdminInitializer();
    }

    @Test
    void createsInitialAdminWhenEnabledAndNoAdminExists() {
        initializer.createInitialAdminIfNeeded(
                userRepository,
                passwordEncoder,
                new InitialAdminProperties(true, "OWNER@thepiratemax.com", "strong-admin-password", "Owner Admin")
        );

        UserEntity admin = userRepository.findByEmail("owner@thepiratemax.com").orElseThrow();
        assertThat(admin.getRole()).isEqualTo(UserRole.ADMIN);
        assertThat(admin.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(passwordEncoder.matches("strong-admin-password", admin.getPasswordHash())).isTrue();
    }

    @Test
    void skipsCreationWhenAdminAlreadyExists() {
        UserEntity existingAdmin = new UserEntity();
        existingAdmin.setEmail("admin@thepiratemax.com");
        existingAdmin.setName("Existing Admin");
        existingAdmin.setRole(UserRole.ADMIN);
        existingAdmin.setStatus(UserStatus.ACTIVE);
        existingAdmin.setPasswordHash(passwordEncoder.encode("old-password"));
        userRepository.save(existingAdmin);

        initializer.createInitialAdminIfNeeded(
                userRepository,
                passwordEncoder,
                new InitialAdminProperties(true, "new-admin@thepiratemax.com", "strong-admin-password", "New Admin")
        );

        assertThat(userRepository.existsByEmail("new-admin@thepiratemax.com")).isFalse();
        assertThat(userRepository.existsByEmail("admin@thepiratemax.com")).isTrue();
    }

    @Test
    void rejectsWeakInitialAdminPassword() {
        assertThatThrownBy(() -> initializer.createInitialAdminIfNeeded(
                userRepository,
                passwordEncoder,
                new InitialAdminProperties(true, "owner@thepiratemax.com", "weak", "Owner Admin")
        )).isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("INITIAL_ADMIN_PASSWORD");
    }
}
