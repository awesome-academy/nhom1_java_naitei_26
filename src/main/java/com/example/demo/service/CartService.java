package com.example.demo.service;

import com.example.demo.entity.Cart;
import com.example.demo.entity.CartItem;

import java.util.List;

public interface CartService {

    /**
     * Lấy giỏ hàng của người dùng theo userId. Nếu người dùng chưa có giỏ hàng, tự động tạo mới.
     *
     * @param userId ID của người dùng
     * @return Đối tượng Cart của người dùng
     */
    Cart getOrCreateCartByUserId(Long userId);

    /**
     * Lấy danh sách sản phẩm (CartItem) trong giỏ hàng của người dùng.
     *
     * @param userId ID của người dùng
     * @return Danh sách các CartItem
     */
    List<CartItem> getCartItemsByUserId(Long userId);

    /**
     * Thêm sản phẩm vào giỏ hàng của người dùng.
     * Nếu sản phẩm đã tồn tại trong giỏ, tự động cộng dồn số lượng.
     *
     * @param userId ID của người dùng
     * @param productId ID của sản phẩm
     * @param quantity Số lượng thêm
     * @return CartItem đã được thêm hoặc cập nhật
     */
    CartItem addToCart(Long userId, Long productId, Integer quantity);

    /**
     * Cập nhật số lượng của một sản phẩm trong giỏ hàng.
     * Nếu số lượng <= 0, tự động xóa sản phẩm đó khỏi giỏ.
     *
     * @param userId ID của người dùng (đảm bảo quyền chính chủ)
     * @param cartItemId ID của CartItem
     * @param quantity Số lượng mới
     * @return CartItem sau khi cập nhật (hoặc null nếu bị xóa)
     */
    CartItem updateCartItemQuantity(Long userId, Long cartItemId, Integer quantity);

    /**
     * Xóa một sản phẩm khỏi giỏ hàng.
     *
     * @param userId ID của người dùng (đảm bảo quyền chính chủ)
     * @param cartItemId ID của CartItem cần xóa
     */
    void removeCartItem(Long userId, Long cartItemId);

    /**
     * Xóa sạch toàn bộ sản phẩm trong giỏ hàng của người dùng.
     *
     * @param userId ID của người dùng
     */
    void clearCart(Long userId);
}
