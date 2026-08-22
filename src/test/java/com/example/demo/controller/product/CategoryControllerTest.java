package com.example.demo.controller.product;

import com.example.demo.dto.request.product.CategoryRequest;
import com.example.demo.dto.response.product.CategoryResponse;
import com.example.demo.enums.product.CategoryStatus;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.service.product.CategoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private CategoryService categoryService;

    private CategoryRequest categoryRequest;
    private CategoryResponse categoryResponse;

    @BeforeEach
    void setUp() {
        categoryRequest = new CategoryRequest();
        categoryRequest.setName("Food Category");
        categoryRequest.setDescription("Tasty foods");
        categoryRequest.setStatus(CategoryStatus.ACTIVE);

        categoryResponse = CategoryResponse.builder()
                .id(1L)
                .name("Food Category")
                .description("Tasty foods")
                .status(CategoryStatus.ACTIVE)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createCategory_AsAdmin_ReturnsCreated() throws Exception {
        Mockito.when(categoryService.createCategory(any(CategoryRequest.class)))
                .thenReturn(categoryResponse);

        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(categoryRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Tạo danh mục thành công"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("Food Category"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void createCategory_AsUser_ReturnsForbidden() throws Exception {
        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(categoryRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    void createCategory_Anonymous_ReturnsForbidden() throws Exception {
        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(categoryRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateCategory_AsAdmin_ReturnsOk() throws Exception {
        Mockito.when(categoryService.updateCategory(eq(1L), any(CategoryRequest.class)))
                .thenReturn(categoryResponse);

        mockMvc.perform(put("/api/categories/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(categoryRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.name").value("Food Category"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteCategory_AsAdmin_ReturnsOk() throws Exception {
        Mockito.doNothing().when(categoryService).deleteCategory(1L);

        mockMvc.perform(delete("/api/categories/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Xóa danh mục thành công"));
    }

    @Test
    void getCategoryById_Public_ReturnsOk() throws Exception {
        Mockito.when(categoryService.getCategoryById(1L)).thenReturn(categoryResponse);

        mockMvc.perform(get("/api/categories/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Food Category"));
    }

    @Test
    void getCategoryById_NotFound_ReturnsNotFound() throws Exception {
        Mockito.when(categoryService.getCategoryById(99L))
                .thenThrow(new ResourceNotFoundException("Category", "id", 99L));

        mockMvc.perform(get("/api/categories/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getAllCategories_Public_ReturnsOk() throws Exception {
        List<CategoryResponse> list = Collections.singletonList(categoryResponse);
        Mockito.when(categoryService.getAllCategories()).thenReturn(list);

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].name").value("Food Category"));
    }
}
