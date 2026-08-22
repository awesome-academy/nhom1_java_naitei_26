package com.example.demo.service.product;

import com.example.demo.dto.response.product.ProductImageResponse;
import com.example.demo.entity.product.ProductImage;
import com.example.demo.entity.product.Product;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.product.ProductImageRepository;
import com.example.demo.repository.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductImageService {

    private final ProductImageRepository productImageRepository;
    private final ProductRepository productRepository;

    public ProductImageResponse createProductImage(Long productId, String imageUrl, Boolean isPrimary, Integer displayOrder) {
        ProductImage productImage = new ProductImage();
        productImage.setProduct(findProduct(productId));
        productImage.setImageUrl(imageUrl);
        productImage.setIsPrimary(isPrimary);
        productImage.setDisplayOrder(displayOrder);
        productImage.setCreatedAt(OffsetDateTime.now());
        productImage.setUpdatedAt(OffsetDateTime.now());

        ProductImage saved = productImageRepository.save(productImage);
        return mapToResponse(saved);
    }

    public ProductImageResponse getPrimaryProductImage(Long productId) {
        List<ProductImageResponse> images = getProductImagesByProductId(productId);
        return images.stream()
                .filter(ProductImageResponse::getIsPrimary)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("ProductImage", "primary image for product " + productId, productId));
    }

    public ProductImageResponse updateProductImage(Long imageId, String imageUrl, Boolean isPrimary, Integer displayOrder) {
        ProductImage productImage = findProductImage(imageId);
        productImage.setImageUrl(imageUrl);
        productImage.setIsPrimary(isPrimary);
        productImage.setDisplayOrder(displayOrder);
        productImage.setUpdatedAt(OffsetDateTime.now());

        ProductImage saved = productImageRepository.save(productImage);
        return mapToResponse(saved);
    }

    public void deleteProductImage(Long imageId) {
        productImageRepository.delete(findProductImage(imageId));
    }

    public ProductImageResponse getProductImageById(Long imageId) {
        return mapToResponse(findProductImage(imageId));
    }

    public List<ProductImageResponse> getProductImagesByProductId(Long productId) {
        return productImageRepository.findByProductId(productId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProductImageResponse setPrimaryImage(Long imageId) {
        ProductImage productImage = findProductImage(imageId);
        productImage.setIsPrimary(true);
        productImageRepository.findByProductId(productImage.getProduct().getId())
                .stream()
                .filter(img -> !img.getId().equals(productImage.getId()))
                .forEach(img -> img.setIsPrimary(false));
        ProductImage saved = productImageRepository.save(productImage);
        return mapToResponse(saved);
    }

    private Product findProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
    }

    private ProductImage findProductImage(Long imageId) {
        return productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductImage", "id", imageId));
    }

    private ProductImageResponse mapToResponse(ProductImage productImage) {
        return ProductImageResponse.builder()
                .id(productImage.getId())
                .productId(productImage.getProduct().getId())
                .productName(productImage.getProduct().getName())
                .imageUrl(productImage.getImageUrl())
                .isPrimary(productImage.getIsPrimary())
                .displayOrder(productImage.getDisplayOrder())
                .createdAt(productImage.getCreatedAt())
                .updatedAt(productImage.getUpdatedAt())
                .build();
    }
}