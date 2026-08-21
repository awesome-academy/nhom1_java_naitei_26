package com.example.demo.config.security;

import com.example.demo.entity.auth.OAuthAccount;
import com.example.demo.entity.auth.RefreshToken;
import com.example.demo.entity.auth.User;
import com.example.demo.enums.auth.OAuthProvider;
import com.example.demo.enums.auth.UserRole;
import com.example.demo.enums.auth.UserStatus;
import com.example.demo.repository.auth.OAuthAccountRepository;
import com.example.demo.repository.auth.UserRepository;
import com.example.demo.service.auth.RefreshTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OAuth2AuthenticationSuccessHandlerTest {

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OAuthAccountRepository oauthAccountRepository;

    @InjectMocks
    private OAuth2AuthenticationSuccessHandler successHandler;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    private User sampleUser;
    private RefreshToken sampleRefreshToken;

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();

        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setEmail("testuser@facebook.com");
        sampleUser.setFullName("Test Facebook User");
        sampleUser.setRole(UserRole.USER);
        sampleUser.setStatus(UserStatus.ACTIVE);
        sampleUser.setCreatedAt(OffsetDateTime.now());
        sampleUser.setUpdatedAt(OffsetDateTime.now());

        sampleRefreshToken = new RefreshToken();
        sampleRefreshToken.setId(1L);
        sampleRefreshToken.setUser(sampleUser);
        sampleRefreshToken.setToken("sample-refresh-token-uuid");
        sampleRefreshToken.setExpiryDate(Instant.now().plusSeconds(604800));
    }

    @Test
    @DisplayName("Task #99065: Đăng nhập Facebook thành công cho User mới (Tạo User + Tạo OAuthAccount + Cấp JWT)")
    void testFacebookLogin_NewUser_Success() throws Exception {
        // Given
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("id", "fb_1020304050");
        attributes.put("name", "Nguyen Van FB");
        attributes.put("email", "fb.newuser@example.com");

        OAuth2User oAuth2User = new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                attributes,
                "id"
        );

        OAuth2AuthenticationToken authentication = new OAuth2AuthenticationToken(
                oAuth2User,
                oAuth2User.getAuthorities(),
                "facebook"
        );

        User savedUser = new User();
        savedUser.setId(10L);
        savedUser.setEmail("fb.newuser@example.com");
        savedUser.setFullName("Nguyen Van FB");
        savedUser.setRole(UserRole.USER);
        savedUser.setStatus(UserStatus.ACTIVE);

        when(userRepository.findByEmail("fb.newuser@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(oauthAccountRepository.findByProviderAndProviderUserId(OAuthProvider.FACEBOOK, "fb_1020304050"))
                .thenReturn(Optional.empty());
        when(jwtTokenProvider.generateTokenFromUsername("fb.newuser@example.com")).thenReturn("mocked-jwt-access-token");
        when(refreshTokenService.createRefreshToken(10L)).thenReturn(sampleRefreshToken);

        // When
        successHandler.onAuthenticationSuccess(request, response, authentication);

        // Then
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertEquals("fb.newuser@example.com", userCaptor.getValue().getEmail());
        assertEquals("Nguyen Van FB", userCaptor.getValue().getFullName());
        assertEquals(UserRole.USER, userCaptor.getValue().getRole());
        assertEquals(UserStatus.ACTIVE, userCaptor.getValue().getStatus());

        ArgumentCaptor<OAuthAccount> accountCaptor = ArgumentCaptor.forClass(OAuthAccount.class);
        verify(oauthAccountRepository).save(accountCaptor.capture());
        assertEquals(OAuthProvider.FACEBOOK, accountCaptor.getValue().getProvider());
        assertEquals("fb_1020304050", accountCaptor.getValue().getProviderUserId());

        String redirectUrl = response.getRedirectedUrl();
        assertNotNull(redirectUrl);
        assertTrue(redirectUrl.startsWith("http://localhost:3000/oauth2/redirect"));
        assertTrue(redirectUrl.contains("token=mocked-jwt-access-token"));
        assertTrue(redirectUrl.contains("refreshToken=sample-refresh-token-uuid"));
        assertTrue(redirectUrl.contains("email=fb.newuser%40example.com") || redirectUrl.contains("email=fb.newuser@example.com"));
        assertTrue(redirectUrl.contains("provider=FACEBOOK"));
    }

    @Test
    @DisplayName("Task #99065: Đăng nhập Facebook khi User đã tồn tại email (Identity Linking - Không tạo duplicate User)")
    void testFacebookLogin_ExistingUser_LinkAccount() throws Exception {
        // Given
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("id", "fb_99887766");
        attributes.put("name", "Existing User");
        attributes.put("email", "existing@example.com");

        OAuth2User oAuth2User = new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                attributes,
                "id"
        );

        OAuth2AuthenticationToken authentication = new OAuth2AuthenticationToken(
                oAuth2User,
                oAuth2User.getAuthorities(),
                "facebook"
        );

        User existingUser = new User();
        existingUser.setId(2L);
        existingUser.setEmail("existing@example.com");
        existingUser.setFullName("Existing User Local");
        existingUser.setRole(UserRole.USER);
        existingUser.setStatus(UserStatus.ACTIVE);

        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(existingUser));
        when(oauthAccountRepository.findByProviderAndProviderUserId(OAuthProvider.FACEBOOK, "fb_99887766"))
                .thenReturn(Optional.empty());
        when(jwtTokenProvider.generateTokenFromUsername("existing@example.com")).thenReturn("mocked-jwt-access-token");
        when(refreshTokenService.createRefreshToken(2L)).thenReturn(sampleRefreshToken);

        // When
        successHandler.onAuthenticationSuccess(request, response, authentication);

        // Then: Không tạo User mới, chỉ lưu OAuthAccount
        verify(userRepository, never()).save(any(User.class));

        ArgumentCaptor<OAuthAccount> accountCaptor = ArgumentCaptor.forClass(OAuthAccount.class);
        verify(oauthAccountRepository).save(accountCaptor.capture());
        assertEquals(OAuthProvider.FACEBOOK, accountCaptor.getValue().getProvider());
        assertEquals("fb_99887766", accountCaptor.getValue().getProviderUserId());
        assertEquals(existingUser, accountCaptor.getValue().getUser());

        String redirectUrl = response.getRedirectedUrl();
        assertNotNull(redirectUrl);
        assertTrue(redirectUrl.contains("provider=FACEBOOK"));
        assertTrue(redirectUrl.contains("token=mocked-jwt-access-token"));
    }

    @Test
    @DisplayName("Task #99065: Đăng nhập Facebook lại lần 2 (Đã có cả User và OAuthAccount - Idempotent hoàn toàn)")
    void testFacebookLogin_ExistingOAuthAccount_Success() throws Exception {
        // Given
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("id", "fb_555");
        attributes.put("name", "Re-login User");
        attributes.put("email", "relogin@example.com");

        OAuth2User oAuth2User = new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                attributes,
                "id"
        );

        OAuth2AuthenticationToken authentication = new OAuth2AuthenticationToken(
                oAuth2User,
                oAuth2User.getAuthorities(),
                "facebook"
        );

        User existingUser = new User();
        existingUser.setId(3L);
        existingUser.setEmail("relogin@example.com");
        existingUser.setFullName("Re-login User");
        existingUser.setRole(UserRole.USER);

        OAuthAccount existingOAuthAccount = new OAuthAccount();
        existingOAuthAccount.setId(100L);
        existingOAuthAccount.setUser(existingUser);
        existingOAuthAccount.setProvider(OAuthProvider.FACEBOOK);
        existingOAuthAccount.setProviderUserId("fb_555");

        when(userRepository.findByEmail("relogin@example.com")).thenReturn(Optional.of(existingUser));
        when(oauthAccountRepository.findByProviderAndProviderUserId(OAuthProvider.FACEBOOK, "fb_555"))
                .thenReturn(Optional.of(existingOAuthAccount));
        when(jwtTokenProvider.generateTokenFromUsername("relogin@example.com")).thenReturn("jwt-token-ok");
        when(refreshTokenService.createRefreshToken(3L)).thenReturn(sampleRefreshToken);

        // When
        successHandler.onAuthenticationSuccess(request, response, authentication);

        // Then: Không gọi save cho bất kỳ entity nào
        verify(userRepository, never()).save(any(User.class));
        verify(oauthAccountRepository, never()).save(any(OAuthAccount.class));

        String redirectUrl = response.getRedirectedUrl();
        assertNotNull(redirectUrl);
        assertTrue(redirectUrl.contains("token=jwt-token-ok"));
        assertTrue(redirectUrl.contains("provider=FACEBOOK"));
    }

    @Test
    @DisplayName("Task #99065: Xử lý lỗi khi Facebook không trả về Email")
    void testFacebookLogin_MissingEmail_RedirectError() throws Exception {
        // Given
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("id", "fb_no_email");
        attributes.put("name", "No Email FB");
        // email is null

        OAuth2User oAuth2User = new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                attributes,
                "id"
        );

        OAuth2AuthenticationToken authentication = new OAuth2AuthenticationToken(
                oAuth2User,
                oAuth2User.getAuthorities(),
                "facebook"
        );

        // When
        successHandler.onAuthenticationSuccess(request, response, authentication);

        // Then
        verify(userRepository, never()).save(any(User.class));
        verify(oauthAccountRepository, never()).save(any(OAuthAccount.class));
        verify(jwtTokenProvider, never()).generateTokenFromUsername(anyString());

        String redirectUrl = response.getRedirectedUrl();
        assertNotNull(redirectUrl);
        assertTrue(redirectUrl.contains("http://localhost:3000/dang-nhap?error="));
    }

    @Test
    @DisplayName("Task #99064 Regression Test: Đảm bảo luồng Google OAuth2 vẫn hoạt động chính xác")
    void testGoogleLogin_Regression_Success() throws Exception {
        // Given
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("sub", "google_1122334455");
        attributes.put("name", "Google User Test");
        attributes.put("email", "google.test@gmail.com");

        OAuth2User oAuth2User = new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                attributes,
                "sub"
        );

        OAuth2AuthenticationToken authentication = new OAuth2AuthenticationToken(
                oAuth2User,
                oAuth2User.getAuthorities(),
                "google"
        );

        User savedUser = new User();
        savedUser.setId(20L);
        savedUser.setEmail("google.test@gmail.com");
        savedUser.setFullName("Google User Test");
        savedUser.setRole(UserRole.USER);

        when(userRepository.findByEmail("google.test@gmail.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(oauthAccountRepository.findByProviderAndProviderUserId(OAuthProvider.GOOGLE, "google_1122334455"))
                .thenReturn(Optional.empty());
        when(jwtTokenProvider.generateTokenFromUsername("google.test@gmail.com")).thenReturn("google-jwt-access-token");
        when(refreshTokenService.createRefreshToken(20L)).thenReturn(sampleRefreshToken);

        // When
        successHandler.onAuthenticationSuccess(request, response, authentication);

        // Then
        ArgumentCaptor<OAuthAccount> accountCaptor = ArgumentCaptor.forClass(OAuthAccount.class);
        verify(oauthAccountRepository).save(accountCaptor.capture());
        assertEquals(OAuthProvider.GOOGLE, accountCaptor.getValue().getProvider());
        assertEquals("google_1122334455", accountCaptor.getValue().getProviderUserId());

        String redirectUrl = response.getRedirectedUrl();
        assertNotNull(redirectUrl);
        assertTrue(redirectUrl.contains("provider=GOOGLE"));
    }
}
