package com.example.demo.service.product.impl;

import com.example.demo.dto.request.product.CategoryRequest;
import com.example.demo.dto.response.product.CategoryResponse;
import com.example.demo.entity.product.Category;
import com.example.demo.exception.DuplicateResourceException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.product.CategoryRepository;
import com.example.demo.service.product.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new DuplicateResourceException("Tên danh mục đã tồn tại");
        }

        OffsetDateTime now = OffsetDateTime.now();
        Category category = new Category();
        category.setName(request.getName().trim());
        category.setSlug(request.getSlug().trim());
        category.setDescription(request.getDescription());
        category.setStatus(request.getStatus());
        category.setLabel(request.getLabel());
        category.setCreatedAt(now);
        category.setUpdatedAt(now);

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Override
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(request.getName().trim(), id)) {
            throw new DuplicateResourceException("Tên danh mục đã tồn tại");
        }

        category.setName(request.getName().trim());
        category.setSlug(request.getSlug().trim());
        category.setDescription(request.getDescription());
        category.setStatus(request.getStatus());
        category.setLabel(request.getLabel());
        category.setUpdatedAt(OffsetDateTime.now());

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return mapToResponse(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .status(category.getStatus())
                .label(category.getLabel())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
