package com.thepiratemax.backend.service.payment;

import com.thepiratemax.backend.domain.order.OrderEntity;
import java.time.OffsetDateTime;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
public class FakePixPaymentGateway implements PixPaymentGateway {

    @Override
    public PixPaymentDetails createPixPayment(OrderEntity order) {
        String token = order.getExternalReference().replace("-", "").toUpperCase();
        String payload = "00020101021226THEPIRATEMAX" + token;
        return new PixPaymentDetails(
                payload,
                payload,
                OffsetDateTime.now().plusMinutes(30),
                "pending"
        );
    }
}

