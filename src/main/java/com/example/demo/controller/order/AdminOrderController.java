package com.example.demo.controller.order;

import com.example.demo.dto.response.common.ApiResponse;
import com.example.demo.dto.response.order.OrderResponse;
import com.example.demo.service.order.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final OrderService orderService;

    /**
     * API Admin lấy danh sách tất cả đơn hàng trong hệ thống.
     * GET /api/admin/orders
     */
    @GetMapping
    public ApiResponse<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> response = orderService.getAllOrders();
        return ApiResponse.ok("Lấy toàn bộ đơn hàng hệ thống thành công", response);
    }

}
