package com.example.demo.repository.cart;

import com.example.demo.entity.cart.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCartId(Long cartId);

    List<CartItem> findByCartUserId(Long userId);

    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);

    Optional<CartItem> findByIdAndCartUserId(Long id, Long userId);

    void deleteByCartId(Long cartId);

    void deleteByCartUserId(Long userId);

    List<CartItem> findByIdInAndCartUserId(List<Long> ids, Long userId);

    void deleteByIdInAndCartUserId(List<Long> ids, Long userId);

    void deleteByProductId(Long productId);
}
