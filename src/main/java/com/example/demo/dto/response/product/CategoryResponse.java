package com.example.demo.dto.response.product;

import com.example.demo.enums.product.CategoryStatus;
import com.example.demo.enums.product.ProductType;
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
public class CategoryResponse {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private CategoryStatus status;
    private ProductType label;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
