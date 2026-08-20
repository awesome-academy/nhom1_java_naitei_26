package com.example.demo.controller;

import com.example.demo.dto.request.ProductRequest;
import com.example.demo.dto.response.ApiResponse;
import com.example.demo.dto.response.ProductResponse;
import com.example.demo.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;

    /**
     * 1. Lấy danh sách sản phẩm (công khai: chỉ ACTIVE; admin có thể xem tất cả bằng includeInactive=true)
     */
    @GetMapping
    public ApiResponse<List<ProductResponse>> getAll(
            @RequestParam(defaultValue = "false") boolean includeInactive,
            Authentication authentication) {
        requireAdminIfIncludeInactive(includeInactive, authentication);
        return ApiResponse.ok("Lấy danh sách sản phẩm thành công!", productService.getAll(includeInactive));
    }

    /**
     * 2. Lấy chi tiết sản phẩm theo id
     */
    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getById(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean includeInactive,
            Authentication authentication) {
        requireAdminIfIncludeInactive(includeInactive, authentication);
        return ApiResponse.ok("Lấy thông tin sản phẩm thành công!", productService.getById(id, includeInactive));
    }

    /**
     * 3. Tạo sản phẩm mới (chỉ ADMIN)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        return ApiResponse.ok("Tạo sản phẩm thành công!", productService.create(request));
    }

    /**
     * 4. Cập nhật sản phẩm (chỉ ADMIN)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ProductResponse> update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ApiResponse.ok("Cập nhật sản phẩm thành công!", productService.update(id, request));
    }

    /**
     * 5. Xóa sản phẩm (chỉ ADMIN) — soft delete: chuyển trạng thái sang INACTIVE
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> delete(@PathVariable Long id) {
        productService.delete(id);
        return ApiResponse.ok("Xóa sản phẩm thành công!", null);
    }

    private void requireAdminIfIncludeInactive(boolean includeInactive, Authentication authentication) {
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        if (includeInactive && !isAdmin) {
            throw new AccessDeniedException("Bạn không có quyền xem các mục đã xóa/ẩn!");
        }
    }
}