package com.thepiratemax.backend.api.order;

import com.thepiratemax.backend.service.order.OrderCreationService;
import com.thepiratemax.backend.service.order.OrderQueryService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderCreationService orderCreationService;
    private final OrderQueryService orderQueryService;

    public OrderController(OrderCreationService orderCreationService, OrderQueryService orderQueryService) {
        this.orderCreationService = orderCreationService;
        this.orderQueryService = orderQueryService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreateOrderResponse createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return orderCreationService.create(request);
    }

    @GetMapping
    public List<OrderSummaryResponse> listOrders() {
        return orderQueryService.listCurrentUserOrders();
    }

    @GetMapping("/{orderId}")
    public OrderDetailResponse getOrder(@PathVariable UUID orderId) {
        return orderQueryService.getOrderDetail(orderId);
    }

    @GetMapping("/{orderId}/status")
    public OrderStatusResponse getOrderStatus(@PathVariable UUID orderId) {
        return orderQueryService.getOrderStatus(orderId);
    }

    @GetMapping("/{orderId}/credentials")
    public OrderCredentialsResponse getOrderCredentials(@PathVariable UUID orderId) {
        return orderQueryService.getOrderCredentials(orderId);
    }
}
