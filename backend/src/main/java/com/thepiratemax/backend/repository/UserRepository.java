package com.thepiratemax.backend.repository;

import com.thepiratemax.backend.domain.user.UserEntity;
import com.thepiratemax.backend.domain.user.UserRole;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {

    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByRole(UserRole role);
}
