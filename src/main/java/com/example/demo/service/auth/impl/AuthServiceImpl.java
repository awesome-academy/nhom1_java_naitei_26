package com.example.demo.service.auth.impl;

import com.example.demo.config.security.CustomUserDetails;
import com.example.demo.config.security.JwtTokenProvider;
import com.example.demo.dto.request.auth.LoginRequest;
import com.example.demo.dto.request.auth.RegisterRequest;
import com.example.demo.dto.response.auth.LoginResponse;
import com.example.demo.dto.response.auth.UserResponse;
import com.example.demo.entity.auth.RefreshToken;
import com.example.demo.entity.auth.User;
import com.example.demo.enums.auth.UserRole;
import com.example.demo.enums.auth.UserStatus;
import com.example.demo.exception.DuplicateResourceException;
import com.example.demo.repository.auth.UserRepository;
import com.example.demo.service.auth.AuthService;
import com.example.demo.service.auth.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Authentication authenticate(LoginRequest loginRequest) {
        return authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail().trim(),
                        loginRequest.getPassword()
                )
        );
    }

    @Override
    @Transactional
    public LoginResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticate(loginRequest);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        String accessToken = jwtTokenProvider.generateToken(authentication);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    @Override
    @Transactional
    public UserResponse register(RegisterRequest registerRequest) {
        String email = registerRequest.getEmail().trim().toLowerCase();

        // 1. Kiểm tra trùng lặp email
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email này đã được sử dụng!");
        }

        // 2. Tạo đối tượng User mới và mã hóa mật khẩu
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFullName(registerRequest.getFullName().trim());
        user.setPhone(registerRequest.getPhone() != null && !registerRequest.getPhone().isBlank()
                ? registerRequest.getPhone().trim() : null);
        user.setAddress(registerRequest.getAddress() != null && !registerRequest.getAddress().isBlank()
                ? registerRequest.getAddress().trim() : null);
        user.setRole(UserRole.USER);
        user.setStatus(UserStatus.ACTIVE);
        user.setCreatedAt(OffsetDateTime.now());
        user.setUpdatedAt(OffsetDateTime.now());

        // 3. Lưu vào Database
        User savedUser = userRepository.save(user);

        // 4. Trả về UserResponse an toàn (không lộ mật khẩu)
        return UserResponse.fromEntity(savedUser);
    }
}
