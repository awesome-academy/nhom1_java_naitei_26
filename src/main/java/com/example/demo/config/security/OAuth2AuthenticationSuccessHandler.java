package com.example.demo.config.security;

import com.example.demo.entity.auth.OAuthAccount;
import com.example.demo.entity.auth.User;
import com.example.demo.enums.auth.OAuthProvider;
import com.example.demo.enums.auth.UserRole;
import com.example.demo.enums.auth.UserStatus;
import com.example.demo.repository.auth.OAuthAccountRepository;
import com.example.demo.repository.auth.UserRepository;
import com.example.demo.service.auth.RefreshTokenService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;

@Component
@Slf4j
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final OAuthAccountRepository oauthAccountRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {
        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            log.info("OAuth2 login success from Google. Attributes: {}", oAuth2User.getAttributes());

            String email = oAuth2User.getAttribute("email");
            String name = oAuth2User.getAttribute("name");
            String providerId = oAuth2User.getAttribute("sub");

            if (email == null) {
                log.error("Google OAuth2 login failed: Email not provided by Google.");
                getRedirectStrategy().sendRedirect(request, response, "http://localhost:3000/dang-nhap?error=email_not_found");
                return;
            }

            // Tìm hoặc tạo User
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                log.info("Creating new user for OAuth email: {}", email);
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setFullName(name != null ? name : email.split("@")[0]);
                newUser.setRole(UserRole.USER);
                newUser.setStatus(UserStatus.ACTIVE);
                newUser.setCreatedAt(OffsetDateTime.now());
                newUser.setUpdatedAt(OffsetDateTime.now());
                return userRepository.save(newUser);
            });

            // Tìm hoặc tạo OAuthAccount mapping
            if (providerId != null) {
                try {
                    oauthAccountRepository.findByProviderAndProviderUserId(OAuthProvider.GOOGLE, providerId)
                            .orElseGet(() -> {
                                log.info("Creating new OAuthAccount mapping for user: {}", user.getEmail());
                                OAuthAccount account = new OAuthAccount();
                                account.setUser(user);
                                account.setProvider(OAuthProvider.GOOGLE);
                                account.setProviderUserId(providerId);
                                account.setCreatedAt(OffsetDateTime.now());
                                return oauthAccountRepository.save(account);
                            });
                } catch (Exception ex) {
                    log.warn("Could not save OAuthAccount mapping (table might not exist yet): {}", ex.getMessage());
                }
            }

            String accessToken = jwtTokenProvider.generateTokenFromUsername(user.getEmail());
            String refreshToken = refreshTokenService.createRefreshToken(user.getId()).getToken();

            String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:3000/oauth2/redirect")
                    .queryParam("token", accessToken)
                    .queryParam("refreshToken", refreshToken)
                    .queryParam("email", user.getEmail())
                    .queryParam("name", URLEncoder.encode(user.getFullName() != null ? user.getFullName() : "", StandardCharsets.UTF_8))
                    .queryParam("id", user.getId())
                    .queryParam("role", user.getRole().name())
                    .build().toUriString();

            log.info("Redirecting to frontend: {}", targetUrl);
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } catch (Exception ex) {
            log.error("Lỗi trong OAuth2AuthenticationSuccessHandler: ", ex);
            String errorMsg = URLEncoder.encode(ex.getMessage() != null ? ex.getMessage() : "oauth2_error", StandardCharsets.UTF_8);
            getRedirectStrategy().sendRedirect(request, response, "http://localhost:3000/dang-nhap?error=" + errorMsg);
        }
    }
}
