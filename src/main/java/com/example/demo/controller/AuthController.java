package com.example.demo.controller;

import com.example.demo.common.response.ApiResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<String> login(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authService.authenticate(loginRequest);
        return ApiResponse.ok("Xác thực thông tin đăng nhập thành công!", authentication.getName());
    }
}
