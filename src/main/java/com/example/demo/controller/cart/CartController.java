package com.example.demo.controller.cart;

import com.example.demo.config.security.CustomUserDetails;
import com.example.demo.dto.request.cart.AddToCartRequest;
import com.example.demo.dto.request.cart.UpdateCartItemRequest;
import com.example.demo.dto.response.cart.CartResponse;
import com.example.demo.dto.response.common.ApiResponse;
import com.example.demo.dto.request.order.CreateOrderRequest;
import com.example.demo.dto.response.order.OrderResponse;
import com.example.demo.service.cart.CartService;
import com.example.demo.service.order.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final OrderService orderService;

    @GetMapping
    public ApiResponse<CartResponse> getMyCart(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        CartResponse response = cartService.getCartDetailsByUserId(userId);
        return ApiResponse.ok("Lấy thông tin giỏ hàng thành công", response);
    }

    @PostMapping("/items")
    public ApiResponse<CartResponse> addToCart(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AddToCartRequest request) {
        Long userId = userDetails.getUser().getId();
        cartService.addToCart(userId, request.getProductId(), request.getQuantity());
        CartResponse response = cartService.getCartDetailsByUserId(userId);
        return ApiResponse.ok("Thêm sản phẩm vào giỏ hàng thành công", response);
    }

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

    @DeleteMapping("/items/{cartItemId}")
    public ApiResponse<CartResponse> removeCartItem(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long cartItemId) {
        Long userId = userDetails.getUser().getId();
        cartService.removeCartItem(userId, cartItemId);
        CartResponse response = cartService.getCartDetailsByUserId(userId);
        return ApiResponse.ok("Xóa sản phẩm khỏi giỏ hàng thành công", response);
    }

    @DeleteMapping
    public ApiResponse<CartResponse> clearCart(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        cartService.clearCart(userId);
        CartResponse response = cartService.getCartDetailsByUserId(userId);
        return ApiResponse.ok("Làm rỗng giỏ hàng thành công", response);
    }

    @GetMapping("/validate")
    public ApiResponse<Void> validateCart(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        cartService.validateCart(userId);
        return ApiResponse.ok("Giỏ hàng hợp lệ để tiến hành đặt hàng", null);
    }

    @PostMapping("/checkout")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<OrderResponse> checkoutFromCart(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateOrderRequest request) {
        Long userId = userDetails.getUser().getId();
        OrderResponse response = orderService.createOrder(userId, request);
        return ApiResponse.created("Đặt hàng từ giỏ hàng thành công", response);
    }
}
