package com.thepiratemax.backend.api.admin;

import com.thepiratemax.backend.service.admin.AdminCredentialOperationsService;
import com.thepiratemax.backend.domain.credential.CredentialStatus;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/credentials")
public class AdminCredentialController {

    private final AdminCredentialOperationsService adminCredentialOperationsService;

    public AdminCredentialController(AdminCredentialOperationsService adminCredentialOperationsService) {
        this.adminCredentialOperationsService = adminCredentialOperationsService;
    }

    @GetMapping
    public List<AdminCredentialResponse> listCredentials(
            @RequestParam(required = false) UUID productId,
            @RequestParam(required = false) CredentialStatus status
    ) {
        return adminCredentialOperationsService.listCredentials(productId, status);
    }

    @PostMapping
    public AdminCredentialResponse createCredential(@Valid @RequestBody CreateCredentialRequest request) {
        return adminCredentialOperationsService.createCredential(
                request.productId(),
                request.login(),
                request.password(),
                request.sourceBatch()
        );
    }

    @PostMapping("/{credentialId}/invalidate")
    public AdminCredentialResponse invalidateCredential(
            @PathVariable UUID credentialId,
            @Valid @RequestBody InvalidateCredentialRequest request
    ) {
        return adminCredentialOperationsService.invalidateCredential(credentialId, request.reason());
    }
}
