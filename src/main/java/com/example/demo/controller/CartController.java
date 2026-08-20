package com.example.demo.controller;

import com.example.demo.config.security.CustomUserDetails;
import com.example.demo.dto.response.ApiResponse;
import com.example.demo.dto.response.CartResponse;
import com.example.demo.service.CartService;
import com.example.demo.dto.request.AddToCartRequest;
import com.example.demo.dto.request.UpdateCartItemRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    /**
     * API thêm sản phẩm vào giỏ hàng của người dùng hiện tại (Authenticated User).
     *
     * @param userDetails Đối tượng chứa thông tin User đang đăng nhập
     * @param request DTO chứa productId và quantity
     * @return ApiResponse chứa CartResponse đầy đủ thông tin giỏ hàng sau khi thêm/cập nhật
     */
    @PostMapping("/items")
    public ApiResponse<CartResponse> addToCart(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AddToCartRequest request) {
        Long userId = userDetails.getUser().getId();
        cartService.addToCart(userId, request.getProductId(), request.getQuantity());
        CartResponse response = cartService.getCartDetailsByUserId(userId);
        return ApiResponse.ok("Thêm sản phẩm vào giỏ hàng thành công", response);
    }

    /**
     * API cập nhật số lượng của một món hàng trong giỏ hàng của người dùng hiện tại.
     *
     * @param userDetails Đối tượng chứa thông tin User đang đăng nhập
     * @param cartItemId ID của món hàng trong giỏ (CartItem)
     * @param request DTO chứa số lượng mới (quantity)
     * @return ApiResponse chứa CartResponse đầy đủ thông tin giỏ hàng sau khi cập nhật
     */
    @PutMapping("/items/{cartItemId}")
    public ApiResponse<CartResponse> updateCartItemQuantity(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        Long userId = userDetails.getUser().getId();
        cartService.updateCartItemQuantity(userId, cartItemId, request.getQuantity());
        CartResponse response = cartService.getCartDetailsByUserId(userId);
        return ApiResponse.ok("Cập nhật số lượng sản phẩm thành công", response);
    }
}
