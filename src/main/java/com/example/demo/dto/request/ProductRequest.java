package com.example.demo.dto.request;

import com.example.demo.entity.ProductStatus;
import com.example.demo.entity.ProductType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @NotNull(message = "Danh mục không được để trống!")
    private Long categoryId;

    @NotBlank(message = "Tên sản phẩm không được để trống!")
    @Size(max = 255, message = "Tên sản phẩm không được vượt quá 255 ký tự!")
    private String name;

    @Size(max = 5000, message = "Mô tả không được vượt quá 5000 ký tự!")
    private String description;

    @NotNull(message = "Giá không được để trống!")
    @DecimalMin(value = "0.01", message = "Giá phải lớn hơn 0!")
    private BigDecimal price;

    @NotNull(message = "Số lượng tồn kho không được để trống!")
    @Min(value = 0, message = "Số lượng tồn kho không được âm!")
    private Integer stockQuantity;

    @NotNull(message = "Loại sản phẩm không được để trống!")
    private ProductType type;

    private ProductStatus status;
}