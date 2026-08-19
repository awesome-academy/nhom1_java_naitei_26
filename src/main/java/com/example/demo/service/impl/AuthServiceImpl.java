package com.example.demo.service.impl;

import com.example.demo.config.security.CustomUserDetails;
import com.example.demo.config.security.JwtTokenProvider;
import com.example.demo.dto.request.LoginRequest;
import com.example.demo.dto.response.LoginResponse;
import com.example.demo.entity.RefreshToken;
import com.example.demo.entity.User;
import com.example.demo.service.AuthService;
import com.example.demo.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

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
}
