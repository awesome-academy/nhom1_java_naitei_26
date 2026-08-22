package com.example.demo.dto.request.product;

import com.example.demo.enums.product.ProductStatus;
import com.example.demo.enums.product.ProductType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 200, message = "Tên sản phẩm tối đa 200 ký tự")
    private String name;

    @Size(max = 500, message = "Mô tả tối đa 500 ký tự")
    private String description;

    @NotNull(message = "Giá không được để trống")
    @Positive(message = "Giá phải lớn hơn 0")
    private BigDecimal price;

    @Min(value = 0, message = "Số lượng tồn kho phải lớn hơn hoặc bằng 0")
    private Integer stockQuantity;

    @NotNull(message = "Loại sản phẩm không được để trống")
    private ProductType type;

    @NotNull(message = "Trạng thái không được để trống")
    private ProductStatus status = ProductStatus.ACTIVE;

    @NotNull(message = "ID danh mục không được để trống")
    private Long categoryId;
}