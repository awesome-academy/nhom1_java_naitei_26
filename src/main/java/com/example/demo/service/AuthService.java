package com.example.demo.service;

import com.example.demo.dto.LoginRequest;
import org.springframework.security.core.Authentication;

public interface AuthService {

    /**
     * Xác thực thông tin người dùng bằng email và password.
     *
     * @param loginRequest DTO chứa email và password
     * @return Đối tượng Authentication sau khi xác thực thành công
     */
    Authentication authenticate(LoginRequest loginRequest);
}
