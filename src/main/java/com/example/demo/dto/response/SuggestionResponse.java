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
public class SuggestionResponse {

    private Long id;
    private String productName;
    private ProductType type;
    private String description;
    private SuggestionStatus status;
    // Ghi chú của admin khi duyệt/từ chối; null khi đề xuất vừa được tạo.
    private String adminNote;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
