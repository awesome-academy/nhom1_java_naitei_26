package com.example.demo.service.impl;

import com.example.demo.entity.Cart;
import com.example.demo.entity.CartItem;
import com.example.demo.entity.Product;
import com.example.demo.entity.User;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CartItemRepository;
import com.example.demo.repository.CartRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {  

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    public Cart getOrCreateCartByUserId(Long userId) {            // lấy giỏ hàng của người dùng nếu không có thì tạo mới
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return cartRepository.findByUserId(userId)
                .orElseGet(() -> createNewCartForUser(user));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CartItem> getCartItemsByUserId(Long userId) {     // lấy danh sách sản phẩm trong giỏ hàng của người dùng
        Cart cart = getOrCreateCartByUserId(userId);
        return cartItemRepository.findByCartId(cart.getId());
    }

    @Override
    public CartItem addToCart(Long userId, Long productId, Integer quantity) {           // thêm sản phẩm vào giỏ hàng của người dùng
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Số lượng thêm vào giỏ phải lớn hơn 0");
        }

        Cart cart = getOrCreateCartByUserId(userId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Optional<CartItem> existingCartItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);

        CartItem cartItem;
        if (existingCartItem.isPresent()) {
            cartItem = existingCartItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
            cartItem.setUpdatedAt(OffsetDateTime.now());
        } else {
            cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
            cartItem.setCreatedAt(OffsetDateTime.now());
            cartItem.setUpdatedAt(OffsetDateTime.now());
        }

        cart.setUpdatedAt(OffsetDateTime.now());
        cartRepository.save(cart);

        return cartItemRepository.save(cartItem);
    }

    @Override
    public CartItem updateCartItemQuantity(Long userId, Long cartItemId, Integer quantity) {   // cập nhật số lượng sản phẩm trong giỏ hàng của người dùng
        CartItem cartItem = cartItemRepository.findByIdAndCartUserId(cartItemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem không tồn tại hoặc không thuộc về người dùng có id: " + userId));

        if (quantity == null || quantity <= 0) {
            cartItemRepository.delete(cartItem);
            return null;
        }

        cartItem.setQuantity(quantity);
        cartItem.setUpdatedAt(OffsetDateTime.now());

        Cart cart = cartItem.getCart();
        cart.setUpdatedAt(OffsetDateTime.now());
        cartRepository.save(cart);

        return cartItemRepository.save(cartItem);
    }

    @Override
    public void removeCartItem(Long userId, Long cartItemId) {          // xóa sản phẩm trong giỏ hàng của người dùng
        CartItem cartItem = cartItemRepository.findByIdAndCartUserId(cartItemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem không tồn tại hoặc không thuộc về người dùng có id: " + userId));

        cartItemRepository.delete(cartItem);
    }

    @Override
    public void clearCart(Long userId) {           // xóa toàn bộ sản phẩm trong giỏ hàng của người dùng
        Cart cart = getOrCreateCartByUserId(userId);
        cartItemRepository.deleteByCartId(cart.getId());
    }

    private Cart createNewCartForUser(User user) {              // tạo giỏ hàng mới cho người dùng
        Cart newCart = new Cart();
        newCart.setUser(user);
        newCart.setCreatedAt(OffsetDateTime.now());
        newCart.setUpdatedAt(OffsetDateTime.now());
        return cartRepository.save(newCart);
    }
}
