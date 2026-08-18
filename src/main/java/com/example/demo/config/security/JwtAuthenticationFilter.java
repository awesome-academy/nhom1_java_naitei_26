package com.example.demo.config.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            // Bước 1: Trích xuất JWT Token từ header "Authorization"
            String jwt = getJwtFromRequest(request);

            // Bước 2: Kiểm tra token có tồn tại và hợp lệ không
            if (StringUtils.hasText(jwt) && jwtTokenProvider.validateToken(jwt)) {
                // Bước 3: Lấy email từ token
                String email = jwtTokenProvider.getUsernameFromToken(jwt);

                // Bước 4: Tải UserDetails từ Database
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                if (userDetails != null && userDetails.isEnabled() && userDetails.isAccountNonLocked()) {
                    // Bước 5: Tạo đối tượng Authentication và nạp quyền (authorities)
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Bước 6: Thiết lập vào SecurityContextHolder
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.debug("SecurityContext set: User '{}' with roles: {}", email, userDetails.getAuthorities());
                }
            }
        } catch (Exception ex) {
            log.error("Không thể thiết lập xác thực người dùng trong Security Context: {}", ex.getMessage());
        }

        // Bước 7: Tiếp tục chuyển tiếp request cho các Filter tiếp theo hoặc Controller
        filterChain.doFilter(request, response);
    }

    /**
     * Helper bóc tách Bearer token từ Header
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // Cắt bỏ 7 ký tự đầu "Bearer "
        }
        return null;
    }
}
