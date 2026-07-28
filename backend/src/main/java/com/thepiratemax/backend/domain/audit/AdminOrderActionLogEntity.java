package com.thepiratemax.backend.domain.audit;

import com.thepiratemax.backend.domain.common.BaseEntity;
import com.thepiratemax.backend.domain.order.OrderEntity;
import com.thepiratemax.backend.domain.user.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "admin_order_action_logs")
public class AdminOrderActionLogEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "admin_user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private UserEntity adminUser;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private OrderEntity order;

    @Column(nullable = false, length = 64)
    private String action;

    @Column(nullable = false, length = 1024)
    private String reason;

    @Column(name = "previous_status", nullable = false, length = 64)
    private String previousStatus;

    @Column(name = "new_status", nullable = false, length = 64)
    private String newStatus;

    @Column(name = "created_by_admin_at", nullable = false)
    private OffsetDateTime createdByAdminAt;

    public UserEntity getAdminUser() {
        return adminUser;
    }

    public void setAdminUser(UserEntity adminUser) {
        this.adminUser = adminUser;
    }

    public OrderEntity getOrder() {
        return order;
    }

    public void setOrder(OrderEntity order) {
        this.order = order;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(String previousStatus) {
        this.previousStatus = previousStatus;
    }

    public String getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(String newStatus) {
        this.newStatus = newStatus;
    }

    public OffsetDateTime getCreatedByAdminAt() {
        return createdByAdminAt;
    }

    public void setCreatedByAdminAt(OffsetDateTime createdByAdminAt) {
        this.createdByAdminAt = createdByAdminAt;
    }
}
