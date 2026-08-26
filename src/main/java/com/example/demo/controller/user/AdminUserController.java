package com.example.demo.controller.user;

import com.example.demo.config.security.CustomUserDetails;
import com.example.demo.dto.request.user.UpdateUserStatusRequest;
import com.example.demo.dto.response.common.ApiResponse;
import com.example.demo.dto.response.common.PageResponse;
import com.example.demo.dto.response.order.OrderResponse;
import com.example.demo.dto.response.user.UserAdminResponse;
import com.example.demo.enums.auth.UserRole;
import com.example.demo.enums.auth.UserStatus;
import com.example.demo.service.order.OrderService;
import com.example.demo.service.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;
    private final OrderService orderService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<UserAdminResponse>>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) UserStatus status,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        String trimmedKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        int page = Math.max(0, pageable.getPageNumber());
        int size = Math.min(100, Math.max(1, pageable.getPageSize())); // Giới hạn tối đa 100 phần tử / trang
        Pageable safePageable = PageRequest.of(page, size, pageable.getSort());

        log.info("Admin truy vấn danh sách User: page={}, size={}, keyword={}, role={}, status={}", page, size, trimmedKeyword, role, status);
        Page<UserAdminResponse> result = userService.getAllUsers(trimmedKeyword, role, status, safePageable);
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách người dùng thành công", PageResponse.from(result)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserAdminResponse>> getUserDetail(@PathVariable Long id) {
        log.info("Admin truy vấn chi tiết User ID: {}", id);
        UserAdminResponse result = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok("Lấy chi tiết người dùng thành công", result));
    }

    @GetMapping("/{id}/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getUserOrders(@PathVariable Long id) {
        log.info("Admin truy vấn lịch sử đơn hàng của User ID: {}", id);
        List<OrderResponse> result = orderService.getOrdersByUserId(id);
        return ResponseEntity.ok(ApiResponse.ok("Lấy lịch sử đơn hàng của người dùng thành công", result));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserAdminResponse>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long currentAdminId = userDetails != null && userDetails.getUser() != null ? userDetails.getUser().getId() : null;
        UserAdminResponse result = userService.updateUserStatus(id, request, currentAdminId);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái người dùng thành công", result));
    }
}
