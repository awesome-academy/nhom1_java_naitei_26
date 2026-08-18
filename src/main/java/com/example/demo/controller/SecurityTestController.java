package com.example.demo.controller;

import com.example.demo.common.response.ApiResponse;
import com.example.demo.config.security.CustomUserDetails;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class SecurityTestController {

    /**
     * 1. Public endpoint: Ai cũng gọi được (được cấu hình permitAll trong SecurityConfig)
     */
    @GetMapping("/public")
    public ApiResponse<String> testPublic() {
        return ApiResponse.<String>builder()
                .status(200)
                .message("Public API: Ai cũng truy cập được!")
                .data("Hello Guest")
                .build();
    }

    /**
     * 2. Chỉ cần đăng nhập (Bất kể USER hay ADMIN)
     */
    @GetMapping("/authenticated")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<String> testAuthenticated(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiResponse.<String>builder()
                .status(200)
                .message("Authenticated API: Đăng nhập thành công!")
                .data("Xin chào " + (userDetails != null ? userDetails.getUsername() : "User"))
                .build();
    }

    /**
     * 3. Endpoint dành riêng cho Role USER
     */
    @GetMapping("/user")
    @PreAuthorize("hasRole('USER')")
    public ApiResponse<String> testUserOnly() {
        return ApiResponse.<String>builder()
                .status(200)
                .message("User API: Chỉ ROLE_USER mới vào được!")
                .data("User Protected Content")
                .build();
    }

    /**
     * 4. Endpoint dành riêng cho Role ADMIN
     */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> testAdminOnly() {
        return ApiResponse.<String>builder()
                .status(200)
                .message("Admin API: Chỉ ROLE_ADMIN mới vào được!")
                .data("Admin Dashboard Secret")
                .build();
    }

    /**
     * 5. Endpoint cho phép cả USER hoặc ADMIN
     */
    @GetMapping("/common")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ApiResponse<String> testCommon() {
        return ApiResponse.<String>builder()
                .status(200)
                .message("Common API: Cả USER và ADMIN đều truy cập được!")
                .data("Common Shared Resources")
                .build();
    }

    /**
     * 6. Nâng cao: Chỉ chính chủ User đó HOẶC Admin mới được thao tác
     */
    @GetMapping("/users/{userId}")
    @PreAuthorize("#userId == authentication.principal.user.id or hasRole('ADMIN')")
    public ApiResponse<String> testOwnerOrAdmin(@PathVariable("userId") Long userId) {
        return ApiResponse.<String>builder()
                .status(200)
                .message("Owner API: Bạn là chính chủ User ID = " + userId + " hoặc là Admin!")
                .data("Sensitive Profile Data of User: " + userId)
                .build();
    }
}
