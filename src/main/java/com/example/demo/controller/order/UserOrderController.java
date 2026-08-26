package com.example.demo.controller.order;

import com.example.demo.config.security.CustomUserDetails;
import com.example.demo.dto.request.order.BuyNowRequest;
import com.example.demo.dto.request.order.CreateOrderRequest;
import com.example.demo.dto.response.common.ApiResponse;
import com.example.demo.dto.response.order.OrderResponse;
import com.example.demo.service.order.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class UserOrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<OrderResponse> checkout(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateOrderRequest request) {
        Long userId = userDetails.getUser().getId();
        OrderResponse response = orderService.createOrder(userId, request);
        return ApiResponse.created("Đặt hàng thành công", response);
    }

    @PostMapping("/buy-now")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<OrderResponse> buyNow(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody BuyNowRequest request) {
        Long userId = userDetails.getUser().getId();
        OrderResponse response = orderService.buyNow(userId, request);
        return ApiResponse.created("Đặt hàng mua ngay thành công", response);
    }

    @GetMapping
    public ApiResponse<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        List<OrderResponse> response = orderService.getOrdersByUserId(userId);
        return ApiResponse.ok("Lấy danh sách đơn hàng thành công", response);
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderResponse> getOrderById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        Long userId = userDetails.getUser().getId();
        OrderResponse response = orderService.getOrderByIdAndUserId(id, userId);
        return ApiResponse.ok("Lấy chi tiết đơn hàng thành công", response);
    }
}

