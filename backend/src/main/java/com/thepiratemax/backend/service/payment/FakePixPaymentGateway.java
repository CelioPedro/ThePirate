package com.thepiratemax.backend.service.payment;

import com.thepiratemax.backend.domain.order.OrderEntity;
import java.time.OffsetDateTime;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.integrations.mercado-pago", name = "gateway", havingValue = "fake", matchIfMissing = true)
public class FakePixPaymentGateway implements PixPaymentGateway {

    @Override
    public PixPaymentDetails createPixPayment(OrderEntity order) {
        String token = order.getExternalReference().replace("-", "").toUpperCase();
        String payload = "00020101021226THEPIRATEMAX" + token;
        return new PixPaymentDetails(
                "fake-" + order.getExternalReference(),
                payload,
                payload,
                OffsetDateTime.now().plusMinutes(30),
                "pending",
                "{\"provider\":\"fake\"}"
        );
    }
}
