package com.example.demo.service.product.impl;

import com.example.demo.dto.request.product.ProductRequest;
import com.example.demo.dto.response.product.ProductResponse;
import com.example.demo.entity.product.Category;
import com.example.demo.entity.product.Product;
import com.example.demo.enums.product.ProductStatus;
import com.example.demo.enums.product.ProductType;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.product.CategoryRepository;
import com.example.demo.repository.product.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

@ExtendWith(MockitoExtension.class)
public class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductServiceImpl productServiceImpl;

    private ProductRequest productRequest;
    private Product product;
    private Category category;

    @BeforeEach
    void setUp() {
        category = new Category();
        category.setId(1L);
        category.setName("Beverages");

        productRequest = new ProductRequest();
        productRequest.setCategoryId(1L);
        productRequest.setName("Green Tea");
        productRequest.setDescription("Japanese green tea");
        productRequest.setPrice(new BigDecimal("2.99"));
        productRequest.setStockQuantity(100);
        productRequest.setType(ProductType.DRINK);
        productRequest.setStatus(ProductStatus.ACTIVE);

        product = new Product();
        product.setId(10L);
        product.setCategory(category);
        product.setName("Green Tea");
        product.setDescription("Japanese green tea");
        product.setPrice(new BigDecimal("2.99"));
        product.setStockQuantity(100);
        product.setType(ProductType.DRINK);
        product.setStatus(ProductStatus.ACTIVE);
        product.setCreatedAt(OffsetDateTime.now());
        product.setUpdatedAt(OffsetDateTime.now());
    }

    @Test
    void createProduct_Success() {
        Mockito.when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        Mockito.when(productRepository.save(any(Product.class))).thenReturn(product);

        ProductResponse response = productServiceImpl.createProduct(productRequest);

        assertNotNull(response);
        assertEquals("Green Tea", response.getName());
        assertEquals("Beverages", response.getCategoryName());
    }

    @Test
    void createProduct_CategoryNotFound_ThrowsException() {
        Mockito.when(categoryRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            productServiceImpl.createProduct(productRequest);
        });
    }

    @Test
    void updateProduct_Success() {
        Mockito.when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        Mockito.when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        Mockito.when(productRepository.save(any(Product.class))).thenReturn(product);

        ProductResponse response = productServiceImpl.updateProduct(10L, productRequest);

        assertNotNull(response);
        assertEquals(10L, response.getId());
    }

    @Test
    void updateProduct_ProductNotFound_ThrowsException() {
        Mockito.when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            productServiceImpl.updateProduct(99L, productRequest);
        });
    }

    @Test
    void updateProduct_CategoryNotFound_ThrowsException() {
        Mockito.when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        Mockito.when(categoryRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            productServiceImpl.updateProduct(10L, productRequest);
        });
    }

    @Test
    void getProductById_Success() {
        Mockito.when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        ProductResponse response = productServiceImpl.getProductById(10L);

        assertNotNull(response);
        assertEquals(10L, response.getId());
    }

    @Test
    void getProductById_NotFound_ThrowsException() {
        Mockito.when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            productServiceImpl.getProductById(99L);
        });
    }

    @Test
    void getAllProducts_WithCategoryId_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> page = new PageImpl<>(Collections.singletonList(product));
        Mockito.when(productRepository.findByCategoryId(eq(1L), any(Pageable.class))).thenReturn(page);

        Page<ProductResponse> response = productServiceImpl.getAllProducts(1L, pageable);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals("Green Tea", response.getContent().get(0).getName());
    }

    @Test
    void getAllProducts_WithoutCategoryId_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> page = new PageImpl<>(Collections.singletonList(product));
        Mockito.when(productRepository.findAll(any(Pageable.class))).thenReturn(page);

        Page<ProductResponse> response = productServiceImpl.getAllProducts(null, pageable);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals("Green Tea", response.getContent().get(0).getName());
    }

    @Test
    void deleteProduct_Success() {
        Mockito.when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        Mockito.doNothing().when(productRepository).delete(product);

        productServiceImpl.deleteProduct(10L);

        Mockito.verify(productRepository).delete(product);
    }
}
