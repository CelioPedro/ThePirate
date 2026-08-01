package com.thepiratemax.backend.domain.order;

import com.thepiratemax.backend.domain.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "order_messages")
public class OrderMessageEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private OrderEntity order;

    @Enumerated(EnumType.STRING)
    @Column(name = "sender_role", nullable = false)
    private MessageSenderRole senderRole;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    public OrderEntity getOrder() {
        return order;
    }

    public void setOrder(OrderEntity order) {
        this.order = order;
    }

    public MessageSenderRole getSenderRole() {
        return senderRole;
    }

    public void setSenderRole(MessageSenderRole senderRole) {
        this.senderRole = senderRole;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
