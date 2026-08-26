package com.example.demo.service.cart;

import com.example.demo.dto.response.cart.CartResponse;
import com.example.demo.entity.cart.Cart;
import com.example.demo.entity.cart.CartItem;

import java.util.List;

public interface CartService {


    CartResponse getCartDetailsByUserId(Long userId);

    Cart getOrCreateCartByUserId(Long userId);

    List<CartItem> getCartItemsByUserId(Long userId);

    CartItem addToCart(Long userId, Long productId, Integer quantity);

    CartItem updateCartItemQuantity(Long userId, Long cartItemId, Integer quantity);

    void removeCartItem(Long userId, Long cartItemId);

    void clearCart(Long userId);

    void validateCart(Long userId);
}
