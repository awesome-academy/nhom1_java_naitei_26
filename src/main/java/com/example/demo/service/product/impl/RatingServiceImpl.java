package com.example.demo.service.product.impl;

import com.example.demo.dto.request.product.RatingRequest;
import com.example.demo.dto.response.product.RatingResponse;
import com.example.demo.entity.auth.User;
import com.example.demo.entity.product.Product;
import com.example.demo.entity.product.Rating;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.auth.UserRepository;
import com.example.demo.repository.product.ProductRepository;
import com.example.demo.repository.product.RatingRepository;
import com.example.demo.service.product.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RatingServiceImpl implements RatingService {

    private final RatingRepository ratingRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RatingResponse> getRatingsByProductId(Long productId) {
        List<Rating> ratings = ratingRepository.findByProductId(productId);
        return ratings.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RatingResponse createRating(Long productId, Long userId, RatingRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "id", productId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", userId));

        ratingRepository.findByUserIdAndProductId(userId, productId)
                .ifPresent(r -> {
                    throw new IllegalArgumentException("Bạn đã đánh giá sản phẩm này rồi. Vui lòng cập nhật thay vì tạo mới.");
                });

        Rating rating = new Rating();
        rating.setUser(user);
        rating.setProduct(product);
        rating.setScore(request.getScore());
        rating.setComment(request.getComment());
        rating.setCreatedAt(OffsetDateTime.now());
        rating.setUpdatedAt(OffsetDateTime.now());

        Rating saved = ratingRepository.save(rating);
        recalculateProductRating(productId);
        return toResponse(saved);
    }

    @Override
    public RatingResponse updateRating(Long productId, Long userId, RatingRequest request) {
        Rating rating = ratingRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Đánh giá", "productId và userId", productId));

        rating.setScore(request.getScore());
        rating.setComment(request.getComment());
        rating.setUpdatedAt(OffsetDateTime.now());

        Rating saved = ratingRepository.save(rating);
        recalculateProductRating(productId);
        return toResponse(saved);
    }

    @Override
    public void deleteRating(Long productId, Long userId) {
        Rating rating = ratingRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Đánh giá", "productId và userId", productId));

        ratingRepository.delete(rating);
        recalculateProductRating(productId);
    }

    @Override
    public void recalculateProductRating(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "id", productId));

        Double avg = ratingRepository.avgScoreByProductId(productId);
        Long count = ratingRepository.countByProductId(productId);

        product.setRating(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
        product.setReviewCount(count.intValue());
        product.setUpdatedAt(OffsetDateTime.now());
        productRepository.save(product);
    }

    private RatingResponse toResponse(Rating rating) {
        return RatingResponse.builder()
                .id(rating.getId())
                .productId(rating.getProduct().getId())
                .userId(rating.getUser().getId())
                .userName(rating.getUser().getFullName())
                .score(rating.getScore())
                .comment(rating.getComment())
                .createdAt(rating.getCreatedAt())
                .updatedAt(rating.getUpdatedAt())
                .build();
    }
}
