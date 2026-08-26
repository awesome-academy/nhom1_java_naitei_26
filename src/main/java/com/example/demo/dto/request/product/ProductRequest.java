package com.example.demo.dto.request.product;

import com.example.demo.enums.product.ProductStatus;
import com.example.demo.enums.product.ProductType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ProductRequest {

    private List<String> images;

    @NotNull(message = "Mã danh mục không được để trống")
    private Long categoryId;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 255, message = "Tên sản phẩm không được vượt quá 255 ký tự")
    private String name;

    @NotBlank(message = "Slug sản phẩm không được để trống")
    @Size(max = 255, message = "Slug sản phẩm không được vượt quá 255 ký tự")
    private String slug;

    private String brand;
    private BigDecimal oldPrice;
    private String unit;
    private BigDecimal rating;
    private Integer reviewCount;
    private String badge;
    private String shortDescription;
    private String description;

    private String nutritionEnergy;
    private String nutritionProtein;
    private String nutritionFat;
    private String nutritionCarb;
    private String origin;
    private String expiry;
    private String storage;

    @NotNull(message = "Giá sản phẩm không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Giá sản phẩm phải lớn hơn hoặc bằng 0")
    private BigDecimal price;

    @NotNull(message = "Số lượng trong kho không được để trống")
    @Min(value = 0, message = "Số lượng trong kho phải lớn hơn hoặc bằng 0")
    private Integer stockQuantity;

    @NotNull(message = "Loại sản phẩm không được để trống")
    private ProductType type;

    @NotNull(message = "Trạng thái sản phẩm không được để trống")
    private ProductStatus status;
}
