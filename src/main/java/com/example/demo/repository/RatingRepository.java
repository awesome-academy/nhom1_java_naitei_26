package com.example.demo.repository;

import com.example.demo.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByProductId(Long productId);
    Optional<Rating> findByUserIdAndProductId(Long userId, Long productId);
}
