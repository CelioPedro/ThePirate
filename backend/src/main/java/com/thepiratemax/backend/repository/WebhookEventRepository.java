package com.thepiratemax.backend.repository;

import com.thepiratemax.backend.domain.webhook.WebhookEventEntity;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WebhookEventRepository extends JpaRepository<WebhookEventEntity, UUID> {

    Optional<WebhookEventEntity> findByProviderAndProviderEventId(String provider, String providerEventId);
}
