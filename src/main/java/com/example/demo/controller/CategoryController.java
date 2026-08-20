package com.example.demo.controller;

import com.example.demo.dto.request.CategoryRequest;
import com.example.demo.dto.response.ApiResponse;
import com.example.demo.dto.response.CategoryResponse;
import com.example.demo.service.CategoryService;
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
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * 1. Lấy danh sách danh mục (công khai: chỉ ACTIVE; chỉ ADMIN mới được xem INACTIVE qua includeInactive=true)
     */
    @GetMapping
    public ApiResponse<List<CategoryResponse>> getAll(
            @RequestParam(defaultValue = "false") boolean includeInactive,
            Authentication authentication) {
        requireAdminIfIncludeInactive(includeInactive, authentication);
        return ApiResponse.ok("Lấy danh sách danh mục thành công!", categoryService.getAll(includeInactive));
    }

    /**
     * 2. Lấy chi tiết danh mục theo id
     */
    @GetMapping("/{id}")
    public ApiResponse<CategoryResponse> getById(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean includeInactive,
            Authentication authentication) {
        requireAdminIfIncludeInactive(includeInactive, authentication);
        return ApiResponse.ok("Lấy thông tin danh mục thành công!", categoryService.getById(id, includeInactive));
    }

    /**
     * 3. Tạo danh mục mới (chỉ ADMIN)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CategoryResponse> create(@Valid @RequestBody CategoryRequest request) {
        return ApiResponse.ok("Tạo danh mục thành công!", categoryService.create(request));
    }

    /**
     * 4. Cập nhật danh mục (chỉ ADMIN)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CategoryResponse> update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return ApiResponse.ok("Cập nhật danh mục thành công!", categoryService.update(id, request));
    }

    /**
     * 5. Xóa danh mục (chỉ ADMIN) — soft delete: chuyển trạng thái sang INACTIVE
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ApiResponse.ok("Xóa danh mục thành công!", null);
    }

    private void requireAdminIfIncludeInactive(boolean includeInactive, Authentication authentication) {
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        if (includeInactive && !isAdmin) {
            throw new AccessDeniedException("Bạn không có quyền xem các mục đã xóa/ẩn!");
        }
    }
}