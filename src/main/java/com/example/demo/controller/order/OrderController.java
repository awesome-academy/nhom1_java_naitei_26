package com.example.demo.controller.order;

import com.example.demo.config.security.CustomUserDetails;
import com.example.demo.dto.request.order.CreateOrderRequest;
import com.example.demo.dto.response.common.ApiResponse;
import com.example.demo.dto.response.order.OrderResponse;
import com.example.demo.service.order.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * API Checkout - Đặt hàng từ giỏ hàng hoặc danh sách sản phẩm chỉ định.
     *
     * @param userDetails Thông tin User đang đăng nhập
     * @param request DTO chứa thông tin nhận hàng (tên, SĐT, địa chỉ, ghi chú...)
     * @return ApiResponse chứa OrderResponse chi tiết đơn hàng đã tạo thành công
     */
    @PostMapping("/checkout")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<OrderResponse> checkout(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateOrderRequest request) {
        Long userId = userDetails.getUser().getId();
        OrderResponse response = orderService.createOrder(userId, request);
        return ApiResponse.created("Đặt hàng thành công", response);
    }

    /**
     * API lấy danh sách lịch sử đơn hàng của người dùng hiện tại.
     *
     * @param userDetails Thông tin User đang đăng nhập
     * @return ApiResponse chứa danh sách OrderResponse
     */
    @GetMapping
    public ApiResponse<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        List<OrderResponse> response = orderService.getOrdersByUserId(userId);
        return ApiResponse.ok("Lấy danh sách đơn hàng thành công", response);
    }

    /**
     * API xem chi tiết một đơn hàng theo ID (đảm bảo đơn thuộc sở hữu của người dùng hiện tại).
     *
     * @param userDetails Thông tin User đang đăng nhập
     * @param id ID của đơn hàng
     * @return ApiResponse chứa thông tin đơn hàng
     */
    @GetMapping("/{id}")
    public ApiResponse<OrderResponse> getOrderById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        Long userId = userDetails.getUser().getId();
        OrderResponse response = orderService.getOrderByIdAndUserId(id, userId);
        return ApiResponse.ok("Lấy chi tiết đơn hàng thành công", response);
    }

    /**
     * API quản trị viên (Admin) xem tất cả đơn hàng trong hệ thống.
     *
     * @return ApiResponse chứa danh sách toàn bộ đơn hàng
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<OrderResponse>> getAllOrdersForAdmin() {
        List<OrderResponse> response = orderService.getAllOrders();
        return ApiResponse.ok("Lấy toàn bộ đơn hàng hệ thống thành công", response);
    }

    /**
     * API cập nhật trạng thái đơn hàng (dành cho Admin hoặc người dùng hủy đơn).
     *
     * @param id ID của đơn hàng
     * @param status Trạng thái mới
     * @return ApiResponse chứa đơn hàng sau khi cập nhật
     */
    @PutMapping("/{id}/status")
    public ApiResponse<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        OrderResponse response = orderService.updateOrderStatus(id, status);
        return ApiResponse.ok("Cập nhật trạng thái đơn hàng thành công", response);
    }
}
