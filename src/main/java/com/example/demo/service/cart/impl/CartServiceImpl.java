package com.example.demo.service.cart.impl;

import com.example.demo.dto.response.cart.CartItemResponse;
import com.example.demo.dto.response.cart.CartResponse;
import com.example.demo.entity.auth.User;
import com.example.demo.entity.cart.Cart;
import com.example.demo.entity.cart.CartItem;
import com.example.demo.entity.product.Product;
import com.example.demo.entity.product.ProductImage;
import com.example.demo.enums.product.ProductStatus;
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
    public Cart getOrCreateCartByUserId(Long userId) {            
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return cartRepository.findByUserId(userId)
                .orElseGet(() -> createNewCartForUser(user));
    }

    @Override
    @Transactional
    public List<CartItem> getCartItemsByUserId(Long userId) {     
        Cart cart = getOrCreateCartByUserId(userId);
        return cartItemRepository.findByCartId(cart.getId());
    }

    @Override
    public CartItem addToCart(Long userId, Long productId, Integer quantity) {           
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Số lượng thêm vào giỏ phải lớn hơn 0");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new IllegalArgumentException("Sản phẩm '" + product.getName() + "' hiện ngưng hoạt động hoặc không còn bán");
        }

        Cart cart = getOrCreateCartByUserId(userId);
        Optional<CartItem> existingCartItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);

        int totalQuantity = quantity + existingCartItem.map(CartItem::getQuantity).orElse(0);
        int currentStock = product.getStockQuantity() == null ? 0 : product.getStockQuantity();

        if (totalQuantity > currentStock) {
            throw new IllegalArgumentException(String.format(
                    "Số lượng sản phẩm '%s' trong giỏ hàng (%d) vượt quá số lượng tồn kho hiện tại (%d)",
                    product.getName(), totalQuantity, currentStock
            ));
        }

        CartItem cartItem;
        if (existingCartItem.isPresent()) {
            cartItem = existingCartItem.get();
            cartItem.setQuantity(totalQuantity);
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
    public CartItem updateCartItemQuantity(Long userId, Long cartItemId, Integer quantity) {   
        CartItem cartItem = cartItemRepository.findByIdAndCartUserId(cartItemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem không tồn tại hoặc không thuộc về người dùng có id: " + userId));

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Số lượng sản phẩm phải lớn hơn 0");
        }

        Product product = cartItem.getProduct();
        if (product == null) {
            throw new ResourceNotFoundException("Sản phẩm không tồn tại");
        }

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new IllegalArgumentException("Sản phẩm '" + product.getName() + "' hiện ngưng hoạt động hoặc không còn bán");
        }

        int currentStock = product.getStockQuantity() == null ? 0 : product.getStockQuantity();
        if (quantity > currentStock) {
            throw new IllegalArgumentException(String.format(
                    "Số lượng cập nhật (%d) vượt quá số lượng tồn kho hiện tại (%d) của sản phẩm '%s'",
                    quantity, currentStock, product.getName()
            ));
        }

        cartItem.setQuantity(quantity);
        cartItem.setUpdatedAt(OffsetDateTime.now());

        Cart cart = cartItem.getCart();
        cart.setUpdatedAt(OffsetDateTime.now());
        cartRepository.save(cart);

        return cartItemRepository.save(cartItem);
    }

    @Override
    public void removeCartItem(Long userId, Long cartItemId) {          
        CartItem cartItem = cartItemRepository.findByIdAndCartUserId(cartItemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem không tồn tại hoặc không thuộc về người dùng có id: " + userId));

        Cart cart = cartItem.getCart();
        cart.setUpdatedAt(OffsetDateTime.now());
        cartRepository.save(cart);

        cartItemRepository.delete(cartItem);
    }

    @Override
    public void clearCart(Long userId) {           
        Cart cart = getOrCreateCartByUserId(userId);
        cartItemRepository.deleteByCartId(cart.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public void validateCart(Long userId) {
        Cart cart = getOrCreateCartByUserId(userId);
        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());

        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Giỏ hàng của bạn đang trống");
        }

        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            if (product == null) {
                throw new ResourceNotFoundException("Sản phẩm trong giỏ hàng không tồn tại");
            }

            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new IllegalArgumentException("Sản phẩm '" + product.getName() + "' có số lượng không hợp lệ trong giỏ hàng");
            }

            if (product.getStatus() != ProductStatus.ACTIVE) {
                throw new IllegalArgumentException("Sản phẩm '" + product.getName() + "' hiện ngưng hoạt động hoặc không còn bán");
            }

            int currentStock = product.getStockQuantity() == null ? 0 : product.getStockQuantity();
            if (item.getQuantity() > currentStock) {
                throw new IllegalArgumentException(String.format(
                        "Sản phẩm '%s' vượt quá tồn kho (trong giỏ: %d, tồn kho: %d)",
                        product.getName(), item.getQuantity(), currentStock
                ));
            }
        }
    }

    private Cart createNewCartForUser(User user) {             
        Cart newCart = new Cart();
        newCart.setUser(user);
        newCart.setCreatedAt(OffsetDateTime.now());
        newCart.setUpdatedAt(OffsetDateTime.now());
        return cartRepository.save(newCart);
    }
}
