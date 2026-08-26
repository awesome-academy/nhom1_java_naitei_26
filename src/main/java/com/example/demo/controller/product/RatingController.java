package com.example.demo.controller.product;

import com.example.demo.config.security.CustomUserDetails;
import com.example.demo.dto.request.product.RatingRequest;
import com.example.demo.dto.response.common.ApiResponse;
import com.example.demo.dto.response.product.RatingResponse;
import com.example.demo.service.product.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RatingResponse>>> getRatings(@PathVariable Long productId) {
        List<RatingResponse> ratings = ratingService.getRatingsByProductId(productId);
        return ResponseEntity
                .ok(ApiResponse.ok("Lấy đánh giá thành công", ratings));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RatingResponse>> createRating(
            @PathVariable Long productId,
            @Valid @RequestBody RatingRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        RatingResponse response = ratingService.createRating(productId, userId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đánh giá thành công", response));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<RatingResponse>> updateRating(
            @PathVariable Long productId,
            @Valid @RequestBody RatingRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        RatingResponse response = ratingService.updateRating(productId, userId, request);
        return ResponseEntity
                .ok(ApiResponse.ok("Cập nhật đánh giá thành công", response));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteRating(
            @PathVariable Long productId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        ratingService.deleteRating(productId, userId);
        return ResponseEntity
                .ok(ApiResponse.ok("Xóa đánh giá thành công", null));
    }
}
