package com.example.demo.controller.user;

import com.example.demo.dto.response.common.ApiResponse;
import com.example.demo.dto.response.user.UserAdminResponse;
import com.example.demo.enums.auth.UserRole;
import com.example.demo.enums.auth.UserStatus;
import com.example.demo.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<UserAdminResponse>>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) UserStatus status,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Admin truy vấn danh sách User: page={}, size={}, keyword={}, role={}, status={}", pageable.getPageNumber(), pageable.getPageSize(), keyword, role, status);
        Page<UserAdminResponse> result = userService.getAllUsers(keyword, role, status, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách người dùng thành công", result));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserAdminResponse>> getUserDetail(@PathVariable Long id) {
        log.info("Admin truy vấn chi tiết User ID: {}", id);
        UserAdminResponse result = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok("Lấy chi tiết người dùng thành công", result));
    }
}
