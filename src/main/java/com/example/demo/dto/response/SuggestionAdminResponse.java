package com.example.demo.dto.response;

import com.example.demo.enums.product.ProductType;
import com.example.demo.enums.product.SuggestionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuggestionAdminResponse {

    private Long id;
    private Long userId;
    private String userFullName;
    private String productName;
    private ProductType type;
    private String description;
    private SuggestionStatus status;
    private String adminNote;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
