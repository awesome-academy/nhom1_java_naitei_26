package com.example.demo.controller.user;

import com.example.demo.config.security.CustomUserDetails;
import com.example.demo.dto.response.common.ApiResponse;
import com.example.demo.dto.response.user.UserProfileResponse;
import com.example.demo.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    /**
     * API Lấy thông tin hồ sơ (Profile) của người dùng hiện tại đang đăng nhập.
     * Phân quyền bảo vệ bằng @PreAuthorize("hasAnyRole('USER', 'ADMIN')").
     *
     * @param userDetails Thông tin User trích xuất từ JWT Security Context
     * @return ApiResponse chứa UserProfileResponse
     */
    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ApiResponse<UserProfileResponse> getCurrentUserProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        UserProfileResponse response = userService.getCurrentUserProfile(userId);
        return ApiResponse.ok("Lấy thông tin hồ sơ thành công", response);
    }

    /**
     * Alias endpoint /api/users/me theo chuẩn RESTful.
     */
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ApiResponse<UserProfileResponse> getMe(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return getCurrentUserProfile(userDetails);
    }
}
