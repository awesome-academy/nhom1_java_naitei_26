package com.example.demo.controller.user;

import com.example.demo.config.security.CustomUserDetails;
import com.example.demo.dto.response.user.UserProfileResponse;
import com.example.demo.entity.auth.User;
import com.example.demo.enums.auth.UserRole;
import com.example.demo.enums.auth.UserStatus;
import com.example.demo.service.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;

import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    private User sampleUser;
    private CustomUserDetails customUserDetails;
    private UserProfileResponse profileResponse;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setEmail("hung@example.com");
        sampleUser.setPasswordHash("hashed_password");
        sampleUser.setFullName("Nguyen Duy Hung");
        sampleUser.setPhone("0987654321");
        sampleUser.setAddress("Hanoi, Vietnam");
        sampleUser.setAvatarUrl("https://example.com/avatar.jpg");
        sampleUser.setRole(UserRole.USER);
        sampleUser.setStatus(UserStatus.ACTIVE);
        sampleUser.setCreatedAt(OffsetDateTime.now());
        sampleUser.setUpdatedAt(OffsetDateTime.now());

        customUserDetails = new CustomUserDetails(sampleUser);

        profileResponse = UserProfileResponse.builder()
                .id(1L)
                .email("hung@example.com")
                .fullName("Nguyen Duy Hung")
                .phone("0987654321")
                .address("Hanoi, Vietnam")
                .avatarUrl("https://example.com/avatar.jpg")
                .role("USER")
                .status("ACTIVE")
                .createdAt(sampleUser.getCreatedAt())
                .updatedAt(sampleUser.getUpdatedAt())
                .build();
    }

    @Test
    @DisplayName("GET /api/users/profile - Đã đăng nhập: Trả về 200 và thông tin profile")
    void getProfile_Authenticated_ReturnsOk() throws Exception {
        Mockito.when(userService.getCurrentUserProfile(eq(1L))).thenReturn(profileResponse);

        mockMvc.perform(get("/api/users/profile")
                        .with(user(customUserDetails))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Lấy thông tin hồ sơ thành công"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.email").value("hung@example.com"))
                .andExpect(jsonPath("$.data.fullName").value("Nguyen Duy Hung"))
                .andExpect(jsonPath("$.data.phone").value("0987654321"))
                .andExpect(jsonPath("$.data.role").value("USER"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("GET /api/users/me - Đã đăng nhập: Trả về 200 và thông tin profile")
    void getMe_Authenticated_ReturnsOk() throws Exception {
        Mockito.when(userService.getCurrentUserProfile(eq(1L))).thenReturn(profileResponse);

        mockMvc.perform(get("/api/users/me")
                        .with(user(customUserDetails))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.email").value("hung@example.com"));
    }

    @Test
    @DisplayName("GET /api/users/profile - Chưa đăng nhập (Anonymous): Trả về 401 Unauthorized")
    void getProfile_Anonymous_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/users/profile")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
