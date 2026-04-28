package com.thepiratemax.backend.repository;

import com.thepiratemax.backend.domain.audit.CredentialViewEntity;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CredentialViewRepository extends JpaRepository<CredentialViewEntity, UUID> {
}
