package com.thepiratemax.backend.domain.audit;

import com.thepiratemax.backend.domain.common.BaseEntity;
import com.thepiratemax.backend.domain.credential.CredentialEntity;
import com.thepiratemax.backend.domain.user.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "admin_credential_access_logs")
public class AdminCredentialAccessLogEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "admin_user_id", nullable = false)
    private UserEntity adminUser;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "credential_id", nullable = false)
    private CredentialEntity credential;

    @Column(nullable = false, length = 64)
    private String action;

    @Column(name = "accessed_at", nullable = false)
    private OffsetDateTime accessedAt;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent", length = 512)
    private String userAgent;

    public UserEntity getAdminUser() {
        return adminUser;
    }

    public void setAdminUser(UserEntity adminUser) {
        this.adminUser = adminUser;
    }

    public CredentialEntity getCredential() {
        return credential;
    }

    public void setCredential(CredentialEntity credential) {
        this.credential = credential;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public OffsetDateTime getAccessedAt() {
        return accessedAt;
    }

    public void setAccessedAt(OffsetDateTime accessedAt) {
        this.accessedAt = accessedAt;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
}
