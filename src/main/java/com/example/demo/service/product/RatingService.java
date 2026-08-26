package com.example.demo.service.product;

import com.example.demo.dto.request.product.RatingRequest;
import com.example.demo.dto.response.product.RatingResponse;

import java.util.List;

public interface RatingService {

    List<RatingResponse> getRatingsByProductId(Long productId);

    RatingResponse createRating(Long productId, Long userId, RatingRequest request);

    RatingResponse updateRating(Long productId, Long userId, RatingRequest request);

    void deleteRating(Long productId, Long userId);

    void recalculateProductRating(Long productId);
}
