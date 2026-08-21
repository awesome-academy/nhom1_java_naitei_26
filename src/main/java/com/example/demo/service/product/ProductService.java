package com.example.demo.service.product;

import com.example.demo.dto.request.product.ProductRequest;
import com.example.demo.dto.response.product.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    ProductResponse createProduct(ProductRequest request);
    ProductResponse updateProduct(Long id, ProductRequest request);
    ProductResponse getProductById(Long id);
    Page<ProductResponse> getAllProducts(Long categoryId, Pageable pageable);
    void deleteProduct(Long id);
}
