package com.example.demo.controller;

import com.example.demo.config.security.CustomUserDetails;
import com.example.demo.dto.response.ApiResponse;
import com.example.demo.dto.response.CartResponse;
import com.example.demo.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    /**
     * API xem giỏ hàng của người dùng hiện tại (Authenticated User).
     * Tự động lấy userId từ token JWT đã được xác thực trong Spring Security.
     *
     * @param userDetails Đối tượng chứa thông tin User đang đăng nhập
     * @return ApiResponse bọc CartResponse (bao gồm danh sách món, đơn giá, thành tiền và tổng tiền)
     */
    @GetMapping
    public ApiResponse<CartResponse> getMyCart(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        CartResponse response = cartService.getCartDetailsByUserId(userId);
        return ApiResponse.ok("Lấy thông tin giỏ hàng thành công", response);
    }
}
