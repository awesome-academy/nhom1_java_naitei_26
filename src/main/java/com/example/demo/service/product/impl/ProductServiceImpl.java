package com.example.demo.service.product.impl;

import com.example.demo.dto.request.product.ProductRequest;
import com.example.demo.dto.response.product.ProductResponse;
import com.example.demo.entity.product.Category;
import com.example.demo.entity.product.Product;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.product.CategoryRepository;
import com.example.demo.repository.product.ProductRepository;
import com.example.demo.repository.cart.CartItemRepository;
import com.example.demo.repository.order.OrderItemRepository;
import com.example.demo.service.product.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.product.ProductImage;
import java.util.List;
import java.util.stream.Collectors;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        OffsetDateTime now = OffsetDateTime.now();
        Product product = new Product();
        product.setCategory(category);
        product.setName(request.getName().trim());
        product.setSlug(request.getSlug().trim());
        product.setBrand(request.getBrand() != null ? request.getBrand().trim() : null);
        product.setOldPrice(request.getOldPrice());
        product.setUnit(request.getUnit() != null ? request.getUnit().trim() : null);
        product.setRating(request.getRating());
        product.setReviewCount(request.getReviewCount() != null ? request.getReviewCount() : 0);
        product.setBadge(request.getBadge());
        product.setShortDescription(request.getShortDescription());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setType(request.getType());
        product.setStatus(request.getStatus());
        product.setNutritionEnergy(request.getNutritionEnergy());
        product.setNutritionProtein(request.getNutritionProtein());
        product.setNutritionFat(request.getNutritionFat());
        product.setNutritionCarb(request.getNutritionCarb());
        product.setOrigin(request.getOrigin());
        product.setExpiry(request.getExpiry());
        product.setStorage(request.getStorage());
        product.setCreatedAt(now);
        product.setUpdatedAt(now);

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Override
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        product.setCategory(category);
        product.setName(request.getName().trim());
        product.setSlug(request.getSlug().trim());
        product.setBrand(request.getBrand() != null ? request.getBrand().trim() : null);
        product.setOldPrice(request.getOldPrice());
        product.setUnit(request.getUnit() != null ? request.getUnit().trim() : null);
        product.setRating(request.getRating());
        product.setReviewCount(request.getReviewCount() != null ? request.getReviewCount() : 0);
        product.setBadge(request.getBadge());
        product.setShortDescription(request.getShortDescription());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setType(request.getType());
        product.setStatus(request.getStatus());
        product.setNutritionEnergy(request.getNutritionEnergy());
        product.setNutritionProtein(request.getNutritionProtein());
        product.setNutritionFat(request.getNutritionFat());
        product.setNutritionCarb(request.getNutritionCarb());
        product.setOrigin(request.getOrigin());
        product.setExpiry(request.getExpiry());
        product.setStorage(request.getStorage());
        product.setUpdatedAt(OffsetDateTime.now());

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapToResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(Long categoryId, Pageable pageable) {
        Page<Product> productPage;
        if (categoryId != null) {
            productPage = productRepository.findByCategoryId(categoryId, pageable);
        } else {
            productPage = productRepository.findAll(pageable);
        }
        return productPage.map(this::mapToResponse);
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        cartItemRepository.deleteByProductId(id);
        orderItemRepository.deleteByProductId(id);
        productRepository.delete(product);
    }

    private ProductResponse mapToResponse(Product product) {
        List<String> imageUrls = product.getImages() != null ? product.getImages().stream()
                .sorted((a, b) -> {
                    boolean aPrimary = Boolean.TRUE.equals(a.getIsPrimary());
                    boolean bPrimary = Boolean.TRUE.equals(b.getIsPrimary());
                    if (aPrimary && !bPrimary) return -1;
                    if (!aPrimary && bPrimary) return 1;
                    int aOrder = a.getDisplayOrder() != null ? a.getDisplayOrder() : 0;
                    int bOrder = b.getDisplayOrder() != null ? b.getDisplayOrder() : 0;
                    return Integer.compare(aOrder, bOrder);
                })
                .map(ProductImage::getImageUrl)
                .collect(Collectors.toList()) : List.of();

        return ProductResponse.builder()
                .id(product.getId())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .categorySlug(product.getCategory() != null ? product.getCategory().getSlug() : null)
                .name(product.getName())
                .slug(product.getSlug())
                .brand(product.getBrand())
                .price(product.getPrice())
                .oldPrice(product.getOldPrice())
                .unit(product.getUnit())
                .stockQuantity(product.getStockQuantity())
                .rating(product.getRating())
                .reviewCount(product.getReviewCount())
                .badge(product.getBadge())
                .shortDescription(product.getShortDescription())
                .description(product.getDescription())
                .type(product.getType())
                .status(product.getStatus())
                .nutritionEnergy(product.getNutritionEnergy())
                .nutritionProtein(product.getNutritionProtein())
                .nutritionFat(product.getNutritionFat())
                .nutritionCarb(product.getNutritionCarb())
                .origin(product.getOrigin())
                .expiry(product.getExpiry())
                .storage(product.getStorage())
                .images(imageUrls)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
