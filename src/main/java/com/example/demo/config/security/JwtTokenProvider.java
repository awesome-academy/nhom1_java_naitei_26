package com.example.demo.config.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${app.jwt.secret:798d72e412dcee65856dd610b4165ac806bfa4f0207bcf0fa8fe162d323c1a5c}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    /**
     * Tạo SecretKey an toàn từ chuỗi cấu hình (hỗ trợ cả Base64 hoặc Plain text)
     */
    private Key getSigningKey() {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(jwtSecret);
        } catch (Exception e) {
            keyBytes = jwtSecret.getBytes();
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * 1. Sinh Token từ đối tượng Authentication sau khi đăng nhập thành công
     */
    public String generateToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        return generateTokenFromUsername(userPrincipal.getUsername());
    }

    /**
     * Overload: Sinh Token trực tiếp từ email/username
     */
    public String generateTokenFromUsername(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 2. Giải mã Token để lấy lại email/username của người dùng
     */
    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    /**
     * 3. Kiểm tra tính hợp lệ của token và bắt các ngoại lệ chi tiết
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (SignatureException ex) {
            log.error("JWT validation error: Chữ ký Token không hợp lệ (Invalid JWT signature) -> {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            log.error("JWT validation error: Định dạng Token bị sai hoặc đã bị chỉnh sửa (Invalid JWT token) -> {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            log.error("JWT validation error: Token đã hết hạn sử dụng (Expired JWT token) -> {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            log.error("JWT validation error: Token không được hệ thống hỗ trợ (Unsupported JWT token) -> {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.error("JWT validation error: Chuỗi Token rỗng hoặc null (JWT claims string is empty) -> {}", ex.getMessage());
        }
        return false;
    }
}
