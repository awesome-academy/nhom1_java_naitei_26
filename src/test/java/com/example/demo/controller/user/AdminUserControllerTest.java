package com.example.demo.controller.user;

import com.example.demo.config.security.CustomUserDetails;
import com.example.demo.dto.response.user.UserAdminResponse;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminUserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    private CustomUserDetails adminUserDetails;
    private CustomUserDetails regularUserDetails;
    private UserAdminResponse sampleUserResponse;

    @BeforeEach
    void setUp() {
        User adminUser = new User();
        adminUser.setId(1L);
        adminUser.setEmail("admin@example.com");
        adminUser.setFullName("Admin User");
        adminUser.setRole(UserRole.ADMIN);
        adminUser.setStatus(UserStatus.ACTIVE);
        adminUserDetails = new CustomUserDetails(adminUser);

        User regularUser = new User();
        regularUser.setId(2L);
        regularUser.setEmail("user@example.com");
        regularUser.setFullName("Regular User");
        regularUser.setRole(UserRole.USER);
        regularUser.setStatus(UserStatus.ACTIVE);
        regularUserDetails = new CustomUserDetails(regularUser);

        sampleUserResponse = UserAdminResponse.builder()
                .id(2L)
                .email("user@example.com")
                .fullName("Regular User")
                .phone("0912345678")
                .address("Hanoi")
                .role("USER")
                .status("ACTIVE")
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
    }

    @Test
    @DisplayName("GET /api/admin/users - Admin lấy danh sách thành công (200 OK)")
    void getUsers_AsAdmin_Success() throws Exception {
        Page<UserAdminResponse> pageResponse = new PageImpl<>(Collections.singletonList(sampleUserResponse));
        Mockito.when(userService.getAllUsers(any(), any(), any(), any(Pageable.class))).thenReturn(pageResponse);

        mockMvc.perform(get("/api/admin/users")
                        .with(user(adminUserDetails))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.content[0].email").value("user@example.com"));
    }

    @Test
    @DisplayName("GET /api/admin/users/{id} - Admin lấy chi tiết user thành công (200 OK)")
    void getUserDetail_AsAdmin_Success() throws Exception {
        Mockito.when(userService.getUserById(eq(2L))).thenReturn(sampleUserResponse);

        mockMvc.perform(get("/api/admin/users/2")
                        .with(user(adminUserDetails))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.id").value(2))
                .andExpect(jsonPath("$.data.fullName").value("Regular User"));
    }

    @Test
    @DisplayName("GET /api/admin/users - USER thường bị chặn (403 Forbidden)")
    void getUsers_AsRegularUser_Forbidden() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .with(user(regularUserDetails))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/admin/users/{id} - USER thường xem chi tiết bị chặn (403 Forbidden)")
    void getUserDetail_AsRegularUser_Forbidden() throws Exception {
        mockMvc.perform(get("/api/admin/users/2")
                        .with(user(regularUserDetails))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/admin/users - Chưa đăng nhập (401 Unauthorized)")
    void getUsers_Unauthenticated_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
