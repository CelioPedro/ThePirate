package com.thepiratemax.backend.service.admin;

import com.thepiratemax.backend.api.admin.AdminCredentialResponse;
import com.thepiratemax.backend.domain.credential.CredentialEntity;
import com.thepiratemax.backend.domain.credential.CredentialStatus;
import com.thepiratemax.backend.repository.CredentialRepository;
import com.thepiratemax.backend.service.exception.ConflictException;
import com.thepiratemax.backend.service.exception.NotFoundException;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminCredentialOperationsService {

    private static final Logger logger = LoggerFactory.getLogger(AdminCredentialOperationsService.class);

    private final CredentialRepository credentialRepository;

    public AdminCredentialOperationsService(CredentialRepository credentialRepository) {
        this.credentialRepository = credentialRepository;
    }

    @Transactional
    public AdminCredentialResponse invalidateCredential(UUID credentialId, String reason) {
        CredentialEntity credential = credentialRepository.findById(credentialId)
                .orElseThrow(() -> new NotFoundException("CREDENTIAL_NOT_FOUND", "Credential not found: " + credentialId));

        if (credential.getStatus() == CredentialStatus.DELIVERED) {
            throw new ConflictException("CREDENTIAL_ALREADY_DELIVERED", "Delivered credentials cannot be invalidated from stock");
        }

        if (credential.getStatus() != CredentialStatus.INVALID) {
            credential.setStatus(CredentialStatus.INVALID);
            credential.setReservedAt(null);
            credential.setInvalidatedAt(OffsetDateTime.now());
        }

        credential.setInvalidationReason(reason.trim());
        credential = credentialRepository.save(credential);
        logger.info("event=admin_credential_invalidated credentialId={} productId={} productSku={} reason={}",
                credential.getId(), credential.getProduct().getId(), credential.getProduct().getSku(), credential.getInvalidationReason());
        return toResponse(credential);
    }

    private AdminCredentialResponse toResponse(CredentialEntity credential) {
        return new AdminCredentialResponse(
                credential.getId(),
                credential.getProduct().getId(),
                credential.getProduct().getSku(),
                credential.getStatus().name(),
                credential.getSourceBatch(),
                credential.getReservedAt(),
                credential.getDeliveredAt(),
                credential.getInvalidatedAt(),
                credential.getInvalidationReason()
        );
    }
}
