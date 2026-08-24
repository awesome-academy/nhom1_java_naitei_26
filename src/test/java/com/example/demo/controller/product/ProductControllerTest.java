package com.example.demo.controller.product;

import com.example.demo.dto.request.product.ProductRequest;
import com.example.demo.dto.response.product.ProductResponse;
import com.example.demo.enums.product.ProductStatus;
import com.example.demo.enums.product.ProductType;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.service.product.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Collections;

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
public class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private ProductService productService;

    private ProductRequest productRequest;
    private ProductResponse productResponse;

    @BeforeEach
    void setUp() {
        productRequest = new ProductRequest();
        productRequest.setCategoryId(1L);
        productRequest.setName("Apple Juice");
        productRequest.setSlug("apple-juice");
        productRequest.setDescription("Fresh apple juice");
        productRequest.setPrice(new BigDecimal("3.50"));
        productRequest.setStockQuantity(50);
        productRequest.setType(ProductType.DRINK);
        productRequest.setStatus(ProductStatus.ACTIVE);

        productResponse = ProductResponse.builder()
                .id(10L)
                .categoryId(1L)
                .categoryName("Beverages")
                .name("Apple Juice")
                .description("Fresh apple juice")
                .price(new BigDecimal("3.50"))
                .stockQuantity(50)
                .type(ProductType.DRINK)
                .status(ProductStatus.ACTIVE)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createProduct_AsAdmin_ReturnsCreated() throws Exception {
        Mockito.when(productService.createProduct(any(ProductRequest.class)))
                .thenReturn(productResponse);

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Tạo sản phẩm thành công"))
                .andExpect(jsonPath("$.data.id").value(10))
                .andExpect(jsonPath("$.data.name").value("Apple Juice"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void createProduct_AsUser_ReturnsForbidden() throws Exception {
        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    void createProduct_Anonymous_ReturnsForbidden() throws Exception {
        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateProduct_AsAdmin_ReturnsOk() throws Exception {
        Mockito.when(productService.updateProduct(eq(10L), any(ProductRequest.class)))
                .thenReturn(productResponse);

        mockMvc.perform(put("/api/products/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.name").value("Apple Juice"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteProduct_AsAdmin_ReturnsOk() throws Exception {
        Mockito.doNothing().when(productService).deleteProduct(10L);

        mockMvc.perform(delete("/api/products/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Xóa sản phẩm thành công"));
    }

    @Test
    void getProductById_Public_ReturnsOk() throws Exception {
        Mockito.when(productService.getProductById(10L)).thenReturn(productResponse);

        mockMvc.perform(get("/api/products/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Apple Juice"));
    }

    @Test
    void getProductById_NotFound_ReturnsNotFound() throws Exception {
        Mockito.when(productService.getProductById(99L))
                .thenThrow(new ResourceNotFoundException("Product", "id", 99L));

        mockMvc.perform(get("/api/products/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getAllProducts_Public_ReturnsOk() throws Exception {
        Page<ProductResponse> page = new PageImpl<>(Collections.singletonList(productResponse));
        Mockito.when(productService.getAllProducts(any(), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/products")
                        .param("page", "0")
                        .param("size", "10")
                        .param("categoryId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].name").value("Apple Juice"));
    }
}
