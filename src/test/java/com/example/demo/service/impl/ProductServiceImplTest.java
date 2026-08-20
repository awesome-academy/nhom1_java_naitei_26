package com.example.demo.service.impl;

import com.example.demo.dto.request.ProductRequest;
import com.example.demo.dto.response.ProductResponse;
import com.example.demo.entity.Category;
import com.example.demo.entity.Product;
import com.example.demo.entity.ProductStatus;
import com.example.demo.entity.ProductType;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private Category category;

    private Product product;

    @BeforeEach
    void setUp() {
        category = new Category();
        category.setId(1L);
        category.setName("Trái cây");
        category.setStatus(com.example.demo.entity.CategoryStatus.ACTIVE);

        product = new Product();
        product.setId(1L);
        product.setCategory(category);
        product.setName("Táo đỏ");
        product.setDescription("Táo nhập khẩu");
        product.setPrice(new BigDecimal("45000.00"));
        product.setStockQuantity(100);
        product.setType(ProductType.FOOD);
        product.setStatus(ProductStatus.ACTIVE);
        product.setCreatedAt(OffsetDateTime.now());
        product.setUpdatedAt(OffsetDateTime.now());
    }

    @Test
    void getAll_public_returnsOnlyActiveProducts() {
        Product inactive = new Product();
        inactive.setId(2L);
        inactive.setName("Cam úa");
        inactive.setStatus(ProductStatus.INACTIVE);

        when(productRepository.findAllByStatus(ProductStatus.ACTIVE)).thenReturn(List.of(product));

        List<ProductResponse> result = productService.getAll(false);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Táo đỏ");
        assertThat(result.get(0).getCategoryId()).isEqualTo(1L);
        assertThat(result.get(0).getCategoryName()).isEqualTo("Trái cây");
        assertThat(result.get(0).getPrice()).isEqualByComparingTo("45000.00");
        assertThat(result.get(0).getType()).isEqualTo("FOOD");
        verify(productRepository).findAllByStatus(ProductStatus.ACTIVE);
        verify(productRepository, never()).findAll();
    }

    @Test
    void getAll_includeInactive_returnsAllProducts() {
        when(productRepository.findAll()).thenReturn(List.of(product));

        List<ProductResponse> result = productService.getAll(true);

        assertThat(result).hasSize(1);
        verify(productRepository).findAll();
        verify(productRepository, never()).findAllByStatus(any());
    }

    @Test
    void getById_inactiveProductPublic_throwsNotFound() {
        product.setStatus(ProductStatus.INACTIVE);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> productService.getById(1L, false))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Sản phẩm");
    }

    @Test
    void getById_inactiveProductIncludeInactiveTrue_returnsProduct() {
        product.setStatus(ProductStatus.INACTIVE);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        ProductResponse result = productService.getById(1L, true);

        assertThat(result.getStatus()).isEqualTo("INACTIVE");
    }

    @Test
    void getById_notFound_throwsNotFound() {
        when(productRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getById(99L, true))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_success_defaultsStatusToActive() {
        ProductRequest request = ProductRequest.builder()
                .categoryId(1L)
                .name("  Chuối sứ  ")
                .description("  Chuối ngon  ")
                .price(new BigDecimal("20000.00"))
                .stockQuantity(50)
                .type(ProductType.FOOD)
                .build();

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product saved = invocation.getArgument(0);
            saved.setId(7L);
            return saved;
        });

        ProductResponse result = productService.create(request);

        assertThat(result.getId()).isEqualTo(7L);
        assertThat(result.getName()).isEqualTo("Chuối sứ");
        assertThat(result.getDescription()).isEqualTo("Chuối ngon");
        assertThat(result.getStatus()).isEqualTo("ACTIVE");
        assertThat(result.getStockQuantity()).isEqualTo(50);
        verify(productRepository).save(argThat(p -> p.getStatus() == ProductStatus.ACTIVE));
    }

    @Test
    void create_categoryNotFound_throwsNotFound() {
        ProductRequest request = ProductRequest.builder()
                .categoryId(99L)
                .name("Xoài")
                .price(new BigDecimal("10000.00"))
                .stockQuantity(10)
                .type(ProductType.FOOD)
                .build();

        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.create(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Danh mục");
        verify(productRepository, never()).save(any());
    }

    @Test
    void create_withExplicitStatus_keepsStatus() {
        ProductRequest request = ProductRequest.builder()
                .categoryId(1L)
                .name("Nước ép cam")
                .price(new BigDecimal("30000.00"))
                .stockQuantity(0)
                .type(ProductType.DRINK)
                .status(ProductStatus.INACTIVE)
                .build();

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product saved = invocation.getArgument(0);
            saved.setId(8L);
            return saved;
        });

        ProductResponse result = productService.create(request);

        assertThat(result.getType()).isEqualTo("DRINK");
        assertThat(result.getStatus()).isEqualTo("INACTIVE");
    }

    @Test
    void update_success_updatesFieldsAndKeepsStatusWhenNull() {
        ProductRequest request = ProductRequest.builder()
                .categoryId(1L)
                .name("Táo xanh")
                .price(new BigDecimal("50000.00"))
                .stockQuantity(80)
                .type(ProductType.FOOD)
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductResponse result = productService.update(1L, request);

        assertThat(result.getName()).isEqualTo("Táo xanh");
        assertThat(result.getPrice()).isEqualByComparingTo("50000.00");
        assertThat(result.getStockQuantity()).isEqualTo(80);
        assertThat(result.getStatus()).isEqualTo("ACTIVE");
    }

    @Test
    void update_setsNewStatusWhenProvided() {
        ProductRequest request = ProductRequest.builder()
                .categoryId(1L)
                .name("Táo đỏ")
                .price(new BigDecimal("45000.00"))
                .stockQuantity(100)
                .type(ProductType.FOOD)
                .status(ProductStatus.INACTIVE)
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductResponse result = productService.update(1L, request);

        assertThat(result.getStatus()).isEqualTo("INACTIVE");
    }

    @Test
    void update_notFound_throwsNotFound() {
        when(productRepository.findById(anyLong())).thenReturn(Optional.empty());

        ProductRequest request = ProductRequest.builder()
                .categoryId(1L)
                .name("X")
                .price(new BigDecimal("1.00"))
                .stockQuantity(1)
                .type(ProductType.FOOD)
                .build();

        assertThatThrownBy(() -> productService.update(99L, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void delete_setsStatusInactive() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductResponse result = productService.delete(1L);

        assertThat(result.getStatus()).isEqualTo("INACTIVE");
        verify(productRepository).save(argThat(p -> p.getStatus() == ProductStatus.INACTIVE));
    }

    @Test
    void delete_notFound_throwsNotFound() {
        when(productRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.delete(99L))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(productRepository, never()).save(any());
    }
}