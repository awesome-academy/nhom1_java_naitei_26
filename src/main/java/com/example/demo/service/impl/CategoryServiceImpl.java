package com.example.demo.service.impl;

import com.example.demo.dto.request.CategoryRequest;
import com.example.demo.dto.response.CategoryResponse;
import com.example.demo.entity.Category;
import com.example.demo.entity.CategoryStatus;
import com.example.demo.entity.Product;
import com.example.demo.entity.ProductStatus;
import com.example.demo.exception.DuplicateResourceException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAll(boolean includeInactive) {
        List<Category> categories = includeInactive
                ? categoryRepository.findAll()
                : categoryRepository.findAllByStatus(CategoryStatus.ACTIVE);
        return categories.stream().map(CategoryResponse::fromEntity).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getById(Long id, boolean includeInactive) {
        Category category = getEntity(id);
        if (!includeInactive && category.getStatus() != CategoryStatus.ACTIVE) {
            throw new ResourceNotFoundException("Danh mục", "id", id);
        }
        return CategoryResponse.fromEntity(category);
    }

    @Override
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        String name = request.getName().trim();

        if (categoryRepository.existsByNameIgnoreCaseAndStatus(name, CategoryStatus.ACTIVE)) {
            throw new DuplicateResourceException("Tên danh mục đã tồn tại!");
        }

        Category category = new Category();
        category.setName(name);
        category.setDescription(normalizeNullable(request.getDescription()));
        category.setStatus(CategoryStatus.ACTIVE);
        category.setCreatedAt(OffsetDateTime.now());
        category.setUpdatedAt(OffsetDateTime.now());

        return CategoryResponse.fromEntity(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = getEntity(id);
        String name = request.getName().trim();

        if (categoryRepository.existsByNameIgnoreCaseAndIdNotAndStatus(name, id, CategoryStatus.ACTIVE)) {
            throw new DuplicateResourceException("Tên danh mục đã tồn tại!");
        }

        category.setName(name);
        category.setDescription(normalizeNullable(request.getDescription()));
        category.setUpdatedAt(OffsetDateTime.now());

        return CategoryResponse.fromEntity(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse delete(Long id) {
        Category category = getEntity(id);
        OffsetDateTime now = OffsetDateTime.now();

        // Cascade soft delete: ẩn toàn bộ sản phẩm ACTIVE thuộc danh mục này
        List<Product> activeProducts = productRepository
                .findAllByCategoryIdAndStatus(category.getId(), ProductStatus.ACTIVE);
        activeProducts.forEach(product -> {
            product.setStatus(ProductStatus.INACTIVE);
            product.setUpdatedAt(now);
        });
        if (!activeProducts.isEmpty()) {
            productRepository.saveAll(activeProducts);
        }

        category.setStatus(CategoryStatus.INACTIVE);
        category.setUpdatedAt(now);

        return CategoryResponse.fromEntity(categoryRepository.save(category));
    }

    private Category getEntity(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", "id", id));
    }

    private String normalizeNullable(String value) {
        return value != null && !value.isBlank() ? value.trim() : null;
    }
}