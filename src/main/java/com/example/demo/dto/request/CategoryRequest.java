package com.example.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRequest {

    @NotBlank(message = "Tên danh mục không được để trống!")
    @Size(max = 100, message = "Tên danh mục không được vượt quá 100 ký tự!")
    private String name;

    @Size(max = 1000, message = "Mô tả không được vượt quá 1000 ký tự!")
    private String description;
}