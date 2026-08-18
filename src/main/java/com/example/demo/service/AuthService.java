package com.example.demo.service;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
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
     * Đăng nhập và sinh JWT Access Token cho người dùng.
     *
     * @param loginRequest DTO chứa email và password
     * @return LoginResponse chứa accessToken và tokenType
     */
    LoginResponse login(LoginRequest loginRequest);
}
