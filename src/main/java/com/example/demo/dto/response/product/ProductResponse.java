package com.example.demo.dto.response.product;

import com.example.demo.enums.product.ProductStatus;
import com.example.demo.enums.product.ProductType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stockQuantity;
    private ProductType type;
    private ProductStatus status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
