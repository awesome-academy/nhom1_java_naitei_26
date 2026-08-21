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
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
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

            String registrationId = "google";
            if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
                registrationId = oauthToken.getAuthorizedClientRegistrationId();
            }

            log.info("OAuth2 login success from provider: {}. Attributes: {}", registrationId, oAuth2User.getAttributes());

            OAuthProvider provider = OAuthProvider.GOOGLE;
            String providerUserId = null;

            if ("facebook".equalsIgnoreCase(registrationId)) {
                provider = OAuthProvider.FACEBOOK;
                providerUserId = oAuth2User.getAttribute("id");
            } else if ("twitter".equalsIgnoreCase(registrationId)) {
                provider = OAuthProvider.TWITTER;
                providerUserId = oAuth2User.getAttribute("id");
            } else {
                provider = OAuthProvider.GOOGLE;
                providerUserId = oAuth2User.getAttribute("sub");
                if (providerUserId == null) {
                    providerUserId = oAuth2User.getAttribute("id");
                }
            }

            String email = oAuth2User.getAttribute("email");
            String name = oAuth2User.getAttribute("name");
            if (name == null && oAuth2User.getAttribute("first_name") != null) {
                String firstName = oAuth2User.getAttribute("first_name");
                String lastName = oAuth2User.getAttribute("last_name");
                name = (firstName + " " + (lastName != null ? lastName : "")).trim();
            }

            if (email == null || email.isBlank()) {
                log.error("OAuth2 login failed: Email not provided by provider: {}", registrationId);
                String errorMsg = URLEncoder.encode("Email không được cung cấp bởi " + registrationId, StandardCharsets.UTF_8);
                getRedirectStrategy().sendRedirect(request, response, "http://localhost:3000/dang-nhap?error=" + errorMsg);
                return;
            }

            final String finalEmail = email;
            final String finalName = (name != null && !name.isBlank()) ? name : email.split("@")[0];
            final String finalRegistrationId = registrationId;

            // 1. Tìm hoặc tạo User (Idempotent - Không tạo duplicate User khi cùng email)
            User user = userRepository.findByEmail(finalEmail).orElseGet(() -> {
                log.info("Creating new user for OAuth ({}) email: {}", finalRegistrationId, finalEmail);
                User newUser = new User();
                newUser.setEmail(finalEmail);
                newUser.setFullName(finalName);
                newUser.setRole(UserRole.USER);
                newUser.setStatus(UserStatus.ACTIVE);
                newUser.setCreatedAt(OffsetDateTime.now());
                newUser.setUpdatedAt(OffsetDateTime.now());
                return userRepository.save(newUser);
            });

            // 2. Tìm hoặc tạo OAuthAccount mapping (Idempotent)
            if (providerUserId != null) {
                final OAuthProvider currentProvider = provider;
                final String currentProviderUserId = providerUserId;
                try {
                    oauthAccountRepository.findByProviderAndProviderUserId(currentProvider, currentProviderUserId)
                            .orElseGet(() -> {
                                log.info("Creating new OAuthAccount mapping ({}) for user: {}", currentProvider, user.getEmail());
                                OAuthAccount account = new OAuthAccount();
                                account.setUser(user);
                                account.setProvider(currentProvider);
                                account.setProviderUserId(currentProviderUserId);
                                account.setCreatedAt(OffsetDateTime.now());
                                return oauthAccountRepository.save(account);
                            });
                } catch (Exception ex) {
                    log.warn("Could not save OAuthAccount mapping: {}", ex.getMessage());
                }
            }

            // 3. Tạo JWT Token & Refresh Token nội bộ
            String accessToken = jwtTokenProvider.generateTokenFromUsername(user.getEmail());
            String refreshToken = refreshTokenService.createRefreshToken(user.getId()).getToken();

            // 4. Redirect về Frontend cùng thông tin xác thực
            String fullName = user.getFullName() != null ? user.getFullName() : "";
            String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:3000/oauth2/redirect")
                    .queryParam("token", accessToken)
                    .queryParam("refreshToken", refreshToken)
                    .queryParam("email", user.getEmail())
                    .queryParam("name", fullName)
                    .queryParam("id", user.getId())
                    .queryParam("role", user.getRole().name())
                    .queryParam("provider", provider.name())
                    .build()
                    .encode(StandardCharsets.UTF_8)
                    .toUriString();

            log.info("Redirecting to frontend: {}", targetUrl);
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } catch (Exception ex) {
            log.error("Lỗi trong OAuth2AuthenticationSuccessHandler: ", ex);
            String errorMsg = URLEncoder.encode(ex.getMessage() != null ? ex.getMessage() : "oauth2_error", StandardCharsets.UTF_8);
            getRedirectStrategy().sendRedirect(request, response, "http://localhost:3000/dang-nhap?error=" + errorMsg);
        }
    }
}
