package com.example.demo.service;

import com.example.demo.dto.request.CategoryRequest;
import com.example.demo.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {

    List<CategoryResponse> getAll(boolean includeInactive);

    CategoryResponse getById(Long id, boolean includeInactive);

    CategoryResponse create(CategoryRequest request);

    CategoryResponse update(Long id, CategoryRequest request);

    CategoryResponse delete(Long id);
}