package com.example.demo.dto.request.product;

import com.example.demo.enums.product.CategoryStatus;
import com.example.demo.enums.product.ProductType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CategoryRequest {

    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 100, message = "Tên danh mục không được vượt quá 100 ký tự")
    private String name;

    private String description;

    @NotNull(message = "Trạng thái danh mục không được để trống")
    private CategoryStatus status;

    @NotNull(message = "Nhãn danh mục không được để trống")
    private ProductType label;
}
