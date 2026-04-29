package com.thepiratemax.backend.api.admin;

import com.thepiratemax.backend.api.admin.AdminOrderDiagnosticsResponse;
import com.thepiratemax.backend.api.order.OrderStatusResponse;
import com.thepiratemax.backend.service.admin.AdminOrderOperationsService;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final AdminOrderOperationsService adminOrderOperationsService;

    public AdminOrderController(AdminOrderOperationsService adminOrderOperationsService) {
        this.adminOrderOperationsService = adminOrderOperationsService;
    }

    @PostMapping("/{orderId}/reprocess-delivery")
    public OrderStatusResponse reprocessDelivery(@PathVariable UUID orderId) {
        return adminOrderOperationsService.reprocessDelivery(orderId);
    }

    @PostMapping("/{orderId}/release-reservation")
    public OrderStatusResponse releaseReservation(@PathVariable UUID orderId) {
        return adminOrderOperationsService.releaseReservation(orderId);
    }

    @GetMapping("/{orderId}/diagnostics")
    public AdminOrderDiagnosticsResponse getDiagnostics(@PathVariable UUID orderId) {
        return adminOrderOperationsService.getDiagnostics(orderId);
    }
}
