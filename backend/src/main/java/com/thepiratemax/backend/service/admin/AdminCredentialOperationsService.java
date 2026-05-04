package com.thepiratemax.backend.service.admin;

import com.thepiratemax.backend.api.admin.AdminCredentialResponse;
import com.thepiratemax.backend.domain.credential.CredentialEntity;
import com.thepiratemax.backend.domain.credential.CredentialStatus;
import com.thepiratemax.backend.domain.product.ProductEntity;
import com.thepiratemax.backend.domain.product.ProductStatus;
import com.thepiratemax.backend.repository.CredentialRepository;
import com.thepiratemax.backend.repository.ProductRepository;
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

    public AdminCredentialOperationsService(
            CredentialRepository credentialRepository,
            ProductRepository productRepository,
            CredentialCryptoService credentialCryptoService
    ) {
        this.credentialRepository = credentialRepository;
        this.productRepository = productRepository;
        this.credentialCryptoService = credentialCryptoService;
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
                credential.getSourceBatch(),
                credential.getCreatedAt(),
                credential.getReservedAt(),
                credential.getDeliveredAt(),
                credential.getInvalidatedAt(),
                credential.getInvalidationReason()
        );
    }
}
