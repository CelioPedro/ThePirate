package com.thepiratemax.backend.api.admin;

import com.thepiratemax.backend.service.admin.AdminCredentialOperationsService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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

    @PostMapping("/{credentialId}/invalidate")
    public AdminCredentialResponse invalidateCredential(
            @PathVariable UUID credentialId,
            @Valid @RequestBody InvalidateCredentialRequest request
    ) {
        return adminCredentialOperationsService.invalidateCredential(credentialId, request.reason());
    }
}
