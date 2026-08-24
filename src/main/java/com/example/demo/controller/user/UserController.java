package com.example.demo.controller.user;

import com.example.demo.config.security.CustomUserDetails;
import com.example.demo.dto.request.user.UpdateUserProfileRequest;
import com.example.demo.dto.response.common.ApiResponse;
import com.example.demo.dto.response.user.UserProfileResponse;
import com.example.demo.service.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping({"/profile", "/me"})
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUserProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("Request lấy thông tin profile từ user: {}", userDetails.getUsername());
        UserProfileResponse response = userService.getCurrentUserProfile(userDetails.getUser().getId());
        return ResponseEntity.ok(ApiResponse.ok("Lấy thông tin hồ sơ thành công", response));
    }

    @PutMapping({"/profile", "/me"})
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateUserProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UpdateUserProfileRequest request) {
        log.info("Request cập nhật profile từ user: {}", userDetails.getUsername());
        UserProfileResponse response = userService.updateUserProfile(userDetails.getUser().getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thông tin hồ sơ thành công", response));
    }
}
