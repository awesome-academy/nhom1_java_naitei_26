package com.example.demo.service.impl;

import com.example.demo.dto.request.SuggestionRequest;
import com.example.demo.dto.response.SuggestionResponse;
import com.example.demo.entity.product.ProductSuggestion;
import com.example.demo.entity.auth.User;
import com.example.demo.enums.product.SuggestionStatus;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.product.ProductSuggestionRepository;
import com.example.demo.repository.auth.UserRepository;
import com.example.demo.service.SuggestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

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

        return SuggestionResponse.builder()
                .id(saved.getId())
                .productName(saved.getProductName())
                .type(saved.getType())
                .description(saved.getDescription())
                .status(saved.getStatus())
                .createdAt(saved.getCreatedAt())
                .build();
    }
}
