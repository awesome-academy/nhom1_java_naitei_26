package com.example.demo.service.auth;

import com.example.demo.dto.request.auth.LoginRequest;
import com.example.demo.dto.request.auth.RegisterRequest;
import com.example.demo.dto.response.auth.LoginResponse;
import com.example.demo.dto.response.auth.UserResponse;
import org.springframework.security.core.Authentication;

public interface AuthService {

    /**
     * Xác thực thông tin người dùng bằng email và password.
     *
     * @param loginRequest DTO chứa email và password
     * @return Đối tượng Authentication sau khi xác thực thành công
     */
    Authentication authenticate(LoginRequest loginRequest);

    /**
     * Đăng nhập và sinh Access Token + Refresh Token cho người dùng.
     *
     * @param loginRequest DTO chứa email và password
     * @return LoginResponse chứa accessToken, refreshToken và thông tin cơ bản
     */
    LoginResponse login(LoginRequest loginRequest);

    /**
     * Đăng ký tài khoản người dùng mới.
     *
     * @param registerRequest DTO chứa thông tin đăng ký
     * @return UserResponse chứa thông tin tài khoản vừa tạo
     */
    UserResponse register(RegisterRequest registerRequest);
}
