package com.example.demo.service.product.impl;

import com.example.demo.dto.request.product.CategoryRequest;
import com.example.demo.dto.response.product.CategoryResponse;
import com.example.demo.entity.product.Category;
import com.example.demo.enums.product.CategoryStatus;
import com.example.demo.exception.DuplicateResourceException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.product.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;

@ExtendWith(MockitoExtension.class)
public class CategoryServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryServiceImpl categoryServiceImpl;

    private CategoryRequest categoryRequest;
    private Category category;

    @BeforeEach
    void setUp() {
        categoryRequest = new CategoryRequest();
        categoryRequest.setName("Dessert");
        categoryRequest.setDescription("Sweet treats");
        categoryRequest.setStatus(CategoryStatus.ACTIVE);

        category = new Category();
        category.setId(1L);
        category.setName("Dessert");
        category.setDescription("Sweet treats");
        category.setStatus(CategoryStatus.ACTIVE);
        category.setCreatedAt(OffsetDateTime.now());
        category.setUpdatedAt(OffsetDateTime.now());
    }

    @Test
    void createCategory_Success() {
        Mockito.when(categoryRepository.existsByNameIgnoreCase("Dessert")).thenReturn(false);
        Mockito.when(categoryRepository.save(any(Category.class))).thenReturn(category);

        CategoryResponse response = categoryServiceImpl.createCategory(categoryRequest);

        assertNotNull(response);
        assertEquals("Dessert", response.getName());
        Mockito.verify(categoryRepository).save(any(Category.class));
    }

    @Test
    void createCategory_DuplicateName_ThrowsException() {
        Mockito.when(categoryRepository.existsByNameIgnoreCase("Dessert")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> {
            categoryServiceImpl.createCategory(categoryRequest);
        });
    }

    @Test
    void updateCategory_Success() {
        Mockito.when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        Mockito.when(categoryRepository.existsByNameIgnoreCaseAndIdNot("Dessert", 1L)).thenReturn(false);
        Mockito.when(categoryRepository.save(any(Category.class))).thenReturn(category);

        CategoryResponse response = categoryServiceImpl.updateCategory(1L, categoryRequest);

        assertNotNull(response);
        assertEquals("Dessert", response.getName());
    }

    @Test
    void updateCategory_NotFound_ThrowsException() {
        Mockito.when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            categoryServiceImpl.updateCategory(99L, categoryRequest);
        });
    }

    @Test
    void updateCategory_DuplicateName_ThrowsException() {
        Mockito.when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        Mockito.when(categoryRepository.existsByNameIgnoreCaseAndIdNot("Dessert", 1L)).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> {
            categoryServiceImpl.updateCategory(1L, categoryRequest);
        });
    }

    @Test
    void getCategoryById_Success() {
        Mockito.when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        CategoryResponse response = categoryServiceImpl.getCategoryById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    void getCategoryById_NotFound_ThrowsException() {
        Mockito.when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            categoryServiceImpl.getCategoryById(99L);
        });
    }

    @Test
    void getAllCategories_Success() {
        Mockito.when(categoryRepository.findAll()).thenReturn(Collections.singletonList(category));

        List<CategoryResponse> list = categoryServiceImpl.getAllCategories();

        assertEquals(1, list.size());
        assertEquals("Dessert", list.get(0).getName());
    }

    @Test
    void deleteCategory_Success() {
        Mockito.when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        Mockito.doNothing().when(categoryRepository).delete(category);

        categoryServiceImpl.deleteCategory(1L);

        Mockito.verify(categoryRepository).delete(category);
    }
}
