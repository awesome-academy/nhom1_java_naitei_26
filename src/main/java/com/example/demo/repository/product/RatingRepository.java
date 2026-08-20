package com.example.demo.repository.product;

import com.example.demo.entity.product.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByProductId(Long productId);
    Optional<Rating> findByUserIdAndProductId(Long userId, Long productId);
}
