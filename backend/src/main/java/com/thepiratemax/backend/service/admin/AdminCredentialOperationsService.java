package com.thepiratemax.backend.service.admin;

import com.thepiratemax.backend.api.admin.AdminCredentialResponse;
import com.thepiratemax.backend.api.admin.AdminCredentialSecretResponse;
import com.thepiratemax.backend.domain.audit.AdminCredentialAccessLogEntity;
import com.thepiratemax.backend.domain.credential.CredentialEntity;
import com.thepiratemax.backend.domain.credential.CredentialStatus;
import com.thepiratemax.backend.domain.product.ProductEntity;
import com.thepiratemax.backend.domain.product.ProductStatus;
import com.thepiratemax.backend.domain.user.UserEntity;
import com.thepiratemax.backend.repository.AdminCredentialAccessLogRepository;
import com.thepiratemax.backend.repository.CredentialRepository;
import com.thepiratemax.backend.repository.ProductRepository;
import com.thepiratemax.backend.service.auth.CurrentUserProvider;
import com.thepiratemax.backend.service.credential.CredentialCryptoService;
import com.thepiratemax.backend.service.exception.ConflictException;
import com.thepiratemax.backend.service.exception.NotFoundException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminCredentialOperationsService {

    private static final Logger logger = LoggerFactory.getLogger(AdminCredentialOperationsService.class);

    private final CredentialRepository credentialRepository;
    private final ProductRepository productRepository;
    private final CredentialCryptoService credentialCryptoService;
    private final CurrentUserProvider currentUserProvider;
    private final AdminCredentialAccessLogRepository accessLogRepository;

    public AdminCredentialOperationsService(
            CredentialRepository credentialRepository,
            ProductRepository productRepository,
            CredentialCryptoService credentialCryptoService,
            CurrentUserProvider currentUserProvider,
            AdminCredentialAccessLogRepository accessLogRepository
    ) {
        this.credentialRepository = credentialRepository;
        this.productRepository = productRepository;
        this.credentialCryptoService = credentialCryptoService;
        this.currentUserProvider = currentUserProvider;
        this.accessLogRepository = accessLogRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminCredentialResponse> listCredentials(UUID productId, CredentialStatus status) {
        return credentialRepository.searchAdminCredentials(productId, status, PageRequest.of(0, 100)).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AdminCredentialResponse createCredential(UUID productId, String login, String password, String sourceBatch) {
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("PRODUCT_NOT_FOUND", "Product not found: " + productId));

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new ConflictException("PRODUCT_NOT_ACTIVE", "Credentials can only be added to active products");
        }

        if (!product.isRequiresStock()) {
            throw new ConflictException("PRODUCT_DOES_NOT_REQUIRE_STOCK", "Product does not require credential stock");
        }

        CredentialEntity credential = new CredentialEntity();
        credential.setProduct(product);
        credential.setLoginEncrypted(credentialCryptoService.encrypt(login.trim()));
        credential.setPasswordEncrypted(credentialCryptoService.encrypt(password.trim()));
        credential.setEncryptionKeyVersion(credentialCryptoService.currentKeyVersion());
        credential.setStatus(CredentialStatus.AVAILABLE);
        credential.setSourceBatch(normalizeBatch(sourceBatch));
        credential = credentialRepository.save(credential);

        logger.info("event=admin_credential_created credentialId={} productId={} productSku={} sourceBatch={}",
                credential.getId(), product.getId(), product.getSku(), credential.getSourceBatch());
        return toResponse(credential);
    }

    @Transactional
    public AdminCredentialSecretResponse revealCredential(UUID credentialId, String action, String ipAddress, String userAgent) {
        CredentialEntity credential = credentialRepository.findById(credentialId)
                .orElseThrow(() -> new NotFoundException("CREDENTIAL_NOT_FOUND", "Credential not found: " + credentialId));

        UserEntity adminUser = currentUserProvider.getCurrentUser();
        String normalizedAction = normalizeAction(action);
        AdminCredentialAccessLogEntity accessLog = new AdminCredentialAccessLogEntity();
        accessLog.setAdminUser(adminUser);
        accessLog.setCredential(credential);
        accessLog.setAction(normalizedAction);
        accessLog.setAccessedAt(OffsetDateTime.now());
        accessLog.setIpAddress(normalizeLogValue(ipAddress, 255));
        accessLog.setUserAgent(normalizeLogValue(userAgent, 512));
        accessLogRepository.save(accessLog);

        logger.info("event=admin_credential_secret_accessed credentialId={} productId={} productSku={} adminUserId={} action={}",
                credential.getId(), credential.getProduct().getId(), credential.getProduct().getSku(), adminUser.getId(), normalizedAction);

        return new AdminCredentialSecretResponse(
                credential.getId(),
                credentialCryptoService.decrypt(credential.getLoginEncrypted(), credential.getEncryptionKeyVersion()),
                credentialCryptoService.decrypt(credential.getPasswordEncrypted(), credential.getEncryptionKeyVersion())
        );
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

    private String normalizeBatch(String sourceBatch) {
        if (sourceBatch == null || sourceBatch.isBlank()) {
            return "manual-admin";
        }
        return sourceBatch.trim();
    }

    private AdminCredentialResponse toResponse(CredentialEntity credential) {
        return new AdminCredentialResponse(
                credential.getId(),
                credential.getProduct().getId(),
                credential.getProduct().getSku(),
                credential.getProduct().getName(),
                credential.getStatus().name(),
                maskLogin(credentialCryptoService.decrypt(credential.getLoginEncrypted(), credential.getEncryptionKeyVersion())),
                credential.getSourceBatch(),
                credential.getCreatedAt(),
                credential.getReservedAt(),
                credential.getDeliveredAt(),
                credential.getInvalidatedAt(),
                credential.getInvalidationReason()
        );
    }

    private String maskLogin(String login) {
        if (login == null || login.isBlank()) {
            return "********";
        }
        int at = login.indexOf('@');
        if (at > 1) {
            String name = login.substring(0, at);
            String domain = login.substring(at);
            return name.charAt(0) + "*".repeat(Math.min(Math.max(name.length() - 1, 3), 8)) + domain;
        }
        if (login.length() <= 3) {
            return "***";
        }
        return login.substring(0, 2) + "*".repeat(Math.min(login.length() - 2, 8));
    }

    private String normalizeAction(String action) {
        String normalized = action == null ? "REVEAL" : action.trim().toUpperCase();
        return switch (normalized) {
            case "REVEAL", "COPY_LOGIN", "COPY_PASSWORD" -> normalized;
            default -> "REVEAL";
        };
    }

    private String normalizeLogValue(String value, int maxLength) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.length() > maxLength ? trimmed.substring(0, maxLength) : trimmed;
    }
}
