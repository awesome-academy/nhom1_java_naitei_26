package com.example.demo.controller;

import com.example.demo.config.security.JwtTokenProvider;
import com.example.demo.dto.request.LoginRequest;
import com.example.demo.dto.request.TokenRefreshRequest;
import com.example.demo.dto.response.ApiResponse;
import com.example.demo.dto.response.LoginResponse;
import com.example.demo.dto.response.TokenRefreshResponse;
import com.example.demo.entity.RefreshToken;
import com.example.demo.exception.TokenRefreshException;
import com.example.demo.service.AuthService;
import com.example.demo.service.RefreshTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    /**
     * 1. ĐĂNG NHẬP: Trả về cả Access Token và Refresh Token
     */
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        return ApiResponse.ok("Đăng nhập thành công!", response);
    }

    /**
     * 2. REFRESH TOKEN: Cấp Access Token mới khi Access Token cũ hết hạn
     */
    @PostMapping("/refresh")
    public ApiResponse<TokenRefreshResponse> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String newAccessToken = jwtTokenProvider.generateTokenFromUsername(user.getEmail());
                    TokenRefreshResponse response = TokenRefreshResponse.builder()
                            .accessToken(newAccessToken)
                            .refreshToken(requestRefreshToken)
                            .tokenType("Bearer")
                            .build();
                    return ApiResponse.ok("Làm mới token thành công!", response);
                })
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken, "Refresh token không tồn tại trong hệ thống!"));
    }

    /**
     * 3. LOGOUT: Đăng xuất và thu hồi/xóa Refresh Token
     */
    @PostMapping("/logout")
    public ApiResponse<String> logout(@Valid @RequestBody TokenRefreshRequest request) {
        refreshTokenService.revokeOrDeleteToken(request.getRefreshToken());
        SecurityContextHolder.clearContext();
        return ApiResponse.ok("Đăng xuất thành công!", null);
    }
}
