package com.example.demo.service.cart.impl;

import com.example.demo.dto.response.cart.CartItemResponse;
import com.example.demo.dto.response.cart.CartResponse;
import com.example.demo.entity.auth.User;
import com.example.demo.entity.cart.Cart;
import com.example.demo.entity.cart.CartItem;
import com.example.demo.entity.product.Product;
import com.example.demo.entity.product.ProductImage;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.auth.UserRepository;
import com.example.demo.repository.cart.CartItemRepository;
import com.example.demo.repository.cart.CartRepository;
import com.example.demo.repository.product.ProductImageRepository;
import com.example.demo.repository.product.ProductRepository;
import com.example.demo.service.cart.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
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
    private final ProductImageRepository productImageRepository;

    @Override
    @Transactional
    public CartResponse getCartDetailsByUserId(Long userId) {
        Cart cart = getOrCreateCartByUserId(userId);
        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<CartItemResponse> itemResponses = new ArrayList<>();

        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            BigDecimal price = product.getPrice();
            Integer quantity = item.getQuantity();
            BigDecimal subtotal = price.multiply(BigDecimal.valueOf(quantity));

            totalAmount = totalAmount.add(subtotal);

            String imageUrl = productImageRepository.findByProductIdAndIsPrimaryTrue(product.getId())
                    .map(ProductImage::getImageUrl)
                    .orElse(null);

            CartItemResponse itemResponse = CartItemResponse.builder()
                    .id(item.getId())
                    .productId(product.getId())
                    .productName(product.getName())
                    .productImageUrl(imageUrl)
                    .price(price)
                    .quantity(quantity)
                    .subtotal(subtotal)
                    .build();

            itemResponses.add(itemResponse);
        }

        return CartResponse.builder()
                .cartId(cart.getId())
                .userId(userId)
                .items(itemResponses)
                .totalAmount(totalAmount)
                .build();
    }

    @Override
    public Cart getOrCreateCartByUserId(Long userId) {            // lấy giỏ hàng của người dùng nếu không có thì tạo mới
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return cartRepository.findByUserId(userId)
                .orElseGet(() -> createNewCartForUser(user));
    }

    @Override
    @Transactional
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

        Cart cart = cartItem.getCart();
        cart.setUpdatedAt(OffsetDateTime.now());
        cartRepository.save(cart);

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
