package com.example.demo.service.auth;

import com.example.demo.entity.auth.RefreshToken;

import java.util.Optional;

public interface RefreshTokenService {

    Optional<RefreshToken> findByToken(String token);

    RefreshToken createRefreshToken(Long userId);

    RefreshToken verifyExpiration(RefreshToken token);

    int deleteByUserId(Long userId);

    void revokeOrDeleteToken(String token);
}
