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
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private String name;
    private String slug;
    private String brand;
    private BigDecimal price;
    private BigDecimal oldPrice;
    private String unit;
    private Integer stockQuantity;
    private BigDecimal rating;
    private Integer reviewCount;
    private String badge;
    private String shortDescription;
    private String description;
    private ProductType type;
    private ProductStatus status;

    private String nutritionEnergy;
    private String nutritionProtein;
    private String nutritionFat;
    private String nutritionCarb;
    private String origin;
    private String expiry;
    private String storage;

    private List<String> images;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
