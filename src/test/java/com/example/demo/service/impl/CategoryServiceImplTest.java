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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    private Category category;

    @BeforeEach
    void setUp() {
        category = new Category();
        category.setId(1L);
        category.setName("Trái cây");
        category.setDescription("Các loại trái cây tươi");
        category.setStatus(CategoryStatus.ACTIVE);
        category.setCreatedAt(OffsetDateTime.now());
        category.setUpdatedAt(OffsetDateTime.now());
    }

    @Test
    void getAll_public_returnsOnlyActiveCategories() {
        Category inactive = new Category();
        inactive.setId(2L);
        inactive.setName("Bánh kẹo");
        inactive.setStatus(CategoryStatus.INACTIVE);

        when(categoryRepository.findAllByStatus(CategoryStatus.ACTIVE)).thenReturn(List.of(category));

        List<CategoryResponse> result = categoryService.getAll(false);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        assertThat(result.get(0).getName()).isEqualTo("Trái cây");
        verify(categoryRepository).findAllByStatus(CategoryStatus.ACTIVE);
        verify(categoryRepository, never()).findAll();
    }

    @Test
    void getAll_includeInactive_returnsAllCategories() {
        when(categoryRepository.findAll()).thenReturn(List.of(category));

        List<CategoryResponse> result = categoryService.getAll(true);

        assertThat(result).hasSize(1);
        verify(categoryRepository).findAll();
        verify(categoryRepository, never()).findAllByStatus(any());
    }

    @Test
    void getById_activeCategoryWithIncludeInactiveFalse_returnsCategory() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        CategoryResponse result = categoryService.getById(1L, false);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getStatus()).isEqualTo("ACTIVE");
    }

    @Test
    void getById_inactiveCategoryPublic_throwsNotFound() {
        category.setStatus(CategoryStatus.INACTIVE);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        assertThatThrownBy(() -> categoryService.getById(1L, false))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Danh mục");
    }

    @Test
    void getById_inactiveCategoryIncludeInactiveTrue_returnsCategory() {
        category.setStatus(CategoryStatus.INACTIVE);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        CategoryResponse result = categoryService.getById(1L, true);

        assertThat(result.getStatus()).isEqualTo("INACTIVE");
    }

    @Test
    void getById_notFound_throwsNotFound() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.getById(99L, true))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_success_savesTrimmedNameAndDefaultsToActive() {
        CategoryRequest request = CategoryRequest.builder()
                .name("  Rau củ  ")
                .description("  Rau tươi  ")
                .build();

        when(categoryRepository.existsByNameIgnoreCaseAndStatus("Rau củ", CategoryStatus.ACTIVE)).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category saved = invocation.getArgument(0);
            saved.setId(10L);
            return saved;
        });

        CategoryResponse result = categoryService.create(request);

        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getName()).isEqualTo("Rau củ");
        assertThat(result.getDescription()).isEqualTo("Rau tươi");
        assertThat(result.getStatus()).isEqualTo("ACTIVE");
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    void create_duplicateName_throwsDuplicate() {
        when(categoryRepository.existsByNameIgnoreCaseAndStatus("Trái cây", CategoryStatus.ACTIVE)).thenReturn(true);

        CategoryRequest request = CategoryRequest.builder().name("Trái cây").build();

        assertThatThrownBy(() -> categoryService.create(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Tên danh mục đã tồn tại");
        verify(categoryRepository, never()).save(any());
    }

    @Test
    void create_blankDescription_normalizedToNull() {
        CategoryRequest request = CategoryRequest.builder()
                .name("Hải sản")
                .description("   ")
                .build();

        when(categoryRepository.existsByNameIgnoreCaseAndStatus("Hải sản", CategoryStatus.ACTIVE)).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category saved = invocation.getArgument(0);
            saved.setId(11L);
            return saved;
        });

        CategoryResponse result = categoryService.create(request);

        assertThat(result.getDescription()).isNull();
    }

    @Test
    void update_success_updatesFields() {
        CategoryRequest request = CategoryRequest.builder()
                .name("Trái cây tươi")
                .description("Mô tả mới")
                .build();

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(categoryRepository.existsByNameIgnoreCaseAndIdNotAndStatus("Trái cây tươi", 1L, CategoryStatus.ACTIVE)).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CategoryResponse result = categoryService.update(1L, request);

        assertThat(result.getName()).isEqualTo("Trái cây tươi");
        assertThat(result.getDescription()).isEqualTo("Mô tả mới");
    }

    @Test
    void update_duplicateNameAnotherCategory_throwsDuplicate() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(categoryRepository.existsByNameIgnoreCaseAndIdNotAndStatus("Rau củ", 1L, CategoryStatus.ACTIVE)).thenReturn(true);

        CategoryRequest request = CategoryRequest.builder().name("Rau củ").build();

        assertThatThrownBy(() -> categoryService.update(1L, request))
                .isInstanceOf(DuplicateResourceException.class);
        verify(categoryRepository, never()).save(any());
    }

    @Test
    void update_notFound_throwsNotFound() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        CategoryRequest request = CategoryRequest.builder().name("X").build();

        assertThatThrownBy(() -> categoryService.update(99L, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void delete_setsStatusInactive() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CategoryResponse result = categoryService.delete(1L);

        assertThat(result.getStatus()).isEqualTo("INACTIVE");
        verify(categoryRepository).save(argThat(c -> c.getStatus() == CategoryStatus.INACTIVE));
        verify(productRepository, never()).saveAll(anyList());
    }

    @Test
    void delete_cascadesToActiveProducts() {
        Product product1 = new Product();
        product1.setId(1L);
        product1.setStatus(ProductStatus.ACTIVE);

        Product product2 = new Product();
        product2.setId(2L);
        product2.setStatus(ProductStatus.ACTIVE);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.findAllByCategoryIdAndStatus(1L, ProductStatus.ACTIVE))
                .thenReturn(List.of(product1, product2));
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));

        categoryService.delete(1L);

        assertThat(product1.getStatus()).isEqualTo(ProductStatus.INACTIVE);
        assertThat(product2.getStatus()).isEqualTo(ProductStatus.INACTIVE);
        verify(productRepository).saveAll(argThat(products -> ((List<Product>) products).size() == 2));
    }

    @Test
    void create_reusesNameOfSoftDeletedCategory() {
        // M1: tên đã bị soft-delete có thể dùng lại — chỉ chặn trùng với danh mục ACTIVE
        CategoryRequest request = CategoryRequest.builder().name("Rau củ").build();

        when(categoryRepository.existsByNameIgnoreCaseAndStatus("Rau củ", CategoryStatus.ACTIVE)).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category saved = invocation.getArgument(0);
            saved.setId(12L);
            return saved;
        });

        CategoryResponse result = categoryService.create(request);

        assertThat(result.getId()).isEqualTo(12L);
        assertThat(result.getName()).isEqualTo("Rau củ");
    }

    @Test
    void delete_notFound_throwsNotFound() {
        when(categoryRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.delete(99L))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(categoryRepository, never()).save(any());
    }
}