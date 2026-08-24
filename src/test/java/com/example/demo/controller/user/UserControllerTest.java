package com.example.demo.controller.user;

import com.example.demo.config.security.CustomUserDetails;
import com.example.demo.dto.request.user.UpdateUserProfileRequest;
import com.example.demo.dto.response.user.UserProfileResponse;
import com.example.demo.entity.auth.User;
import com.example.demo.enums.auth.UserRole;
import com.example.demo.enums.auth.UserStatus;
import com.example.demo.service.user.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @MockitoBean
    private UserService userService;

    private User sampleUser;
    private CustomUserDetails customUserDetails;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setEmail("test@example.com");
        sampleUser.setPasswordHash("hashed");
        sampleUser.setFullName("Test User");
        sampleUser.setPhone("0912345678");
        sampleUser.setAddress("Hanoi");
        sampleUser.setRole(UserRole.USER);
        sampleUser.setStatus(UserStatus.ACTIVE);
        sampleUser.setCreatedAt(OffsetDateTime.now());
        sampleUser.setUpdatedAt(OffsetDateTime.now());

        customUserDetails = new CustomUserDetails(sampleUser);
    }

    @Test
    @DisplayName("GET /api/users/profile - Thành công khi đã đăng nhập")
    void getCurrentUserProfile_Authenticated_Success() throws Exception {
        UserProfileResponse response = UserProfileResponse.builder()
                .id(1L)
                .email("test@example.com")
                .fullName("Test User")
                .role("USER")
                .status("ACTIVE")
                .createdAt(sampleUser.getCreatedAt())
                .updatedAt(sampleUser.getUpdatedAt())
                .build();

        when(userService.getCurrentUserProfile(1L)).thenReturn(response);

        mockMvc.perform(get("/api/users/profile")
                        .with(user(customUserDetails)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.email").value("test@example.com"))
                .andExpect(jsonPath("$.data.fullName").value("Test User"));
    }

    @Test
    @DisplayName("GET /api/users/profile - 401 Unauthorized khi chưa đăng nhập")
    void getCurrentUserProfile_Unauthenticated_401() throws Exception {
        SecurityContextHolder.clearContext();

        mockMvc.perform(get("/api/users/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("PUT /api/users/profile - Thành công khi đã đăng nhập và dữ liệu hợp lệ")
    void updateUserProfile_Authenticated_Success() throws Exception {
        UpdateUserProfileRequest request = UpdateUserProfileRequest.builder()
                .fullName("Updated Full Name")
                .phone("0912345678")
                .address("123 Street, Hanoi")
                .avatarUrl("https://example.com/avatar.jpg")
                .build();

        UserProfileResponse response = UserProfileResponse.builder()
                .id(1L)
                .email("test@example.com")
                .fullName("Updated Full Name")
                .phone("0912345678")
                .address("123 Street, Hanoi")
                .avatarUrl("https://example.com/avatar.jpg")
                .role("USER")
                .status("ACTIVE")
                .createdAt(sampleUser.getCreatedAt())
                .updatedAt(sampleUser.getUpdatedAt())
                .build();

        when(userService.updateUserProfile(eq(1L), any(UpdateUserProfileRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/users/profile")
                        .with(user(customUserDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Cập nhật thông tin hồ sơ thành công"))
                .andExpect(jsonPath("$.data.fullName").value("Updated Full Name"))
                .andExpect(jsonPath("$.data.phone").value("0912345678"));
    }

    @Test
    @DisplayName("PUT /api/users/profile - 400 Bad Request khi tên để trống")
    void updateUserProfile_ValidationFailure_EmptyName() throws Exception {
        UpdateUserProfileRequest request = UpdateUserProfileRequest.builder()
                .fullName("")
                .phone("0912345678")
                .build();

        mockMvc.perform(put("/api/users/profile")
                        .with(user(customUserDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/users/profile - 400 Bad Request khi số điện thoại sai định dạng")
    void updateUserProfile_ValidationFailure_InvalidPhone() throws Exception {
        UpdateUserProfileRequest request = UpdateUserProfileRequest.builder()
                .fullName("Valid Name")
                .phone("123456")
                .build();

        mockMvc.perform(put("/api/users/profile")
                        .with(user(customUserDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/users/profile - 401 Unauthorized khi chưa đăng nhập")
    void updateUserProfile_Unauthenticated_401() throws Exception {
        SecurityContextHolder.clearContext();

        UpdateUserProfileRequest request = UpdateUserProfileRequest.builder()
                .fullName("Valid Name")
                .build();

        mockMvc.perform(put("/api/users/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
