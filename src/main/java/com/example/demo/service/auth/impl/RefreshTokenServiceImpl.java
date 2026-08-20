package com.example.demo.service.auth.impl;

import com.example.demo.entity.auth.RefreshToken;
import com.example.demo.entity.auth.User;
import com.example.demo.exception.TokenRefreshException;
import com.example.demo.repository.auth.RefreshTokenRepository;
import com.example.demo.repository.auth.UserRepository;
import com.example.demo.service.auth.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private Long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Override
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    /**
     * Tạo mới hoặc tái sử dụng/cập nhật Refresh Token cho User khi đăng nhập
     */
    @Override
    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

        // Kiểm tra xem User đã có RefreshToken trong DB chưa (nếu có thì cập nhật lại hạn dùng và token mới)
        RefreshToken refreshToken = refreshTokenRepository.findByUser(user)
                .orElseGet(() -> RefreshToken.builder().user(user).build());

        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        refreshToken.setRevoked(false);

        return refreshTokenRepository.save(refreshToken);
    }

    /**
     * Kiểm tra thời hạn và trạng thái thu hồi của Refresh Token
     */
    @Override
    @Transactional
    public RefreshToken verifyExpiration(RefreshToken token) {
        // Kiểm tra xem token đã bị revoke (thu hồi khi logout) chưa
        if (token.isRevoked()) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException(token.getToken(), "Refresh Token này đã bị thu hồi (đã logout). Vui lòng đăng nhập lại!");
        }

        // Kiểm tra thời hạn hết hạn
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException(token.getToken(), "Refresh Token đã hết hạn sử dụng. Vui lòng đăng nhập lại!");
        }

        return token;
    }

    @Override
    @Transactional
    public int deleteByUserId(Long userId) {
        return userRepository.findById(userId)
                .map(refreshTokenRepository::deleteByUser)
                .orElse(0);
    }

    @Override
    @Transactional
    public void revokeOrDeleteToken(String token) {
        refreshTokenRepository.findByToken(token).ifPresent(refreshToken -> {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            log.info("Refresh Token [{}] đã được thu hồi thành công.", token);
        });
    }
}
