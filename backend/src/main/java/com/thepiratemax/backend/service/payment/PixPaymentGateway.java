package com.thepiratemax.backend.service.payment;

import com.thepiratemax.backend.domain.order.OrderEntity;

public interface PixPaymentGateway {

    PixPaymentDetails createPixPayment(OrderEntity order);
}

