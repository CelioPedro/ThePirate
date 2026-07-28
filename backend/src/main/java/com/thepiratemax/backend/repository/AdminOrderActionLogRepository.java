package com.thepiratemax.backend.repository;

import com.thepiratemax.backend.domain.audit.AdminOrderActionLogEntity;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminOrderActionLogRepository extends JpaRepository<AdminOrderActionLogEntity, UUID> {
}
