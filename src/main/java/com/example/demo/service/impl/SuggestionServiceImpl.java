package com.example.demo.service.impl;

import com.example.demo.dto.request.SuggestionRequest;
import com.example.demo.dto.request.SuggestionStatusUpdateRequest;
import com.example.demo.dto.response.SuggestionAdminResponse;
import com.example.demo.dto.response.SuggestionResponse;
import com.example.demo.dto.response.SuggestionStatsResponse;
import com.example.demo.entity.product.ProductSuggestion;
import com.example.demo.entity.auth.User;
import com.example.demo.enums.product.ProductType;
import com.example.demo.enums.product.SuggestionStatus;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.product.ProductSuggestionRepository;
import com.example.demo.repository.auth.UserRepository;
import com.example.demo.service.SuggestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SuggestionServiceImpl implements SuggestionService {

    private final ProductSuggestionRepository suggestionRepository;
    private final UserRepository userRepository;

    @Override
    public SuggestionResponse createSuggestion(Long userId, SuggestionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        OffsetDateTime now = OffsetDateTime.now();

        ProductSuggestion suggestion = new ProductSuggestion();
        suggestion.setUser(user);
        suggestion.setProductName(request.getProductName());
        suggestion.setType(request.getType());
        suggestion.setDescription(request.getDescription());
        suggestion.setStatus(SuggestionStatus.PENDING);
        suggestion.setCreatedAt(now);
        suggestion.setUpdatedAt(now);

        ProductSuggestion saved = suggestionRepository.save(suggestion);

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SuggestionResponse> getMySuggestions(Long userId) {
        return suggestionRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<SuggestionAdminResponse> getSuggestions(SuggestionStatus status, ProductType type, String keyword, Pageable pageable) {
        Page<ProductSuggestion> suggestions =
                suggestionRepository.findWithFilters(status, type, keyword, pageable);

        return suggestions.map(this::toAdminResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public SuggestionStatsResponse getSuggestionStats() {
        return SuggestionStatsResponse.builder()
                .total(suggestionRepository.count())
                .pending(suggestionRepository.countByStatus(SuggestionStatus.PENDING))
                .approved(suggestionRepository.countByStatus(SuggestionStatus.APPROVED))
                .rejected(suggestionRepository.countByStatus(SuggestionStatus.REJECTED))
                .build();
    }

    @Override
    public SuggestionAdminResponse updateSuggestionStatus(Long suggestionId, SuggestionStatusUpdateRequest request) {
        ProductSuggestion suggestion = suggestionRepository.findById(suggestionId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductSuggestion", "id", suggestionId));

        suggestion.setStatus(request.getStatus());
        suggestion.setAdminNote(request.getAdminNote());
        suggestion.setUpdatedAt(OffsetDateTime.now());

        ProductSuggestion saved = suggestionRepository.save(suggestion);
        return toAdminResponse(saved);
    }

    private SuggestionResponse toResponse(ProductSuggestion suggestion) {
        return SuggestionResponse.builder()
                .id(suggestion.getId())
                .productName(suggestion.getProductName())
                .type(suggestion.getType())
                .description(suggestion.getDescription())
                .status(suggestion.getStatus())
                .adminNote(suggestion.getAdminNote())
                .createdAt(suggestion.getCreatedAt())
                .updatedAt(suggestion.getUpdatedAt())
                .build();
    }

    private SuggestionAdminResponse toAdminResponse(ProductSuggestion suggestion) {
        return SuggestionAdminResponse.builder()
                .id(suggestion.getId())
                .userId(suggestion.getUser().getId())
                .userFullName(suggestion.getUser().getFullName())
                .productName(suggestion.getProductName())
                .type(suggestion.getType())
                .description(suggestion.getDescription())
                .status(suggestion.getStatus())
                .adminNote(suggestion.getAdminNote())
                .createdAt(suggestion.getCreatedAt())
                .updatedAt(suggestion.getUpdatedAt())
                .build();
    }
}
