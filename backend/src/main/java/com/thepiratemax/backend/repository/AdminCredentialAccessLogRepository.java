package com.thepiratemax.backend.repository;

import com.thepiratemax.backend.domain.audit.AdminCredentialAccessLogEntity;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminCredentialAccessLogRepository extends JpaRepository<AdminCredentialAccessLogEntity, UUID> {
}
