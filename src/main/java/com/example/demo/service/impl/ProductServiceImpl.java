package com.example.demo.service.impl;

import com.example.demo.dto.request.ProductRequest;
import com.example.demo.dto.response.ProductResponse;
import com.example.demo.entity.Category;
import com.example.demo.entity.Product;
import com.example.demo.entity.ProductStatus;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAll(boolean includeInactive) {
        List<Product> products = includeInactive
                ? productRepository.findAll()
                : productRepository.findAllByStatus(ProductStatus.ACTIVE);
        return products.stream().map(ProductResponse::fromEntity).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id, boolean includeInactive) {
        Product product = getEntity(id);
        if (!includeInactive && product.getStatus() != ProductStatus.ACTIVE) {
            throw new ResourceNotFoundException("Sản phẩm", "id", id);
        }
        return ProductResponse.fromEntity(product);
    }

    @Override
    @Transactional
    public ProductResponse create(ProductRequest request) {
        Product product = new Product();
        applyRequest(product, request, true);
        product.setCreatedAt(OffsetDateTime.now());
        product.setUpdatedAt(OffsetDateTime.now());

        return ProductResponse.fromEntity(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = getEntity(id);
        applyRequest(product, request, false);
        product.setUpdatedAt(OffsetDateTime.now());

        return ProductResponse.fromEntity(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse delete(Long id) {
        Product product = getEntity(id);

        product.setStatus(ProductStatus.INACTIVE);
        product.setUpdatedAt(OffsetDateTime.now());

        return ProductResponse.fromEntity(productRepository.save(product));
    }

    private void applyRequest(Product product, ProductRequest request, boolean isCreate) {
        product.setCategory(getCategory(request.getCategoryId()));
        product.setName(request.getName().trim());
        product.setDescription(normalizeNullable(request.getDescription()));
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setType(request.getType());
        if (isCreate) {
            product.setStatus(request.getStatus() != null ? request.getStatus() : ProductStatus.ACTIVE);
        } else if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }
    }

    private Product getEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "id", id));
    }

    private Category getCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", "id", categoryId));
    }

    private String normalizeNullable(String value) {
        return value != null && !value.isBlank() ? value.trim() : null;
    }
}