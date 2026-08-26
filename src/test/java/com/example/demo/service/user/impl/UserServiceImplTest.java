package com.example.demo.service.user.impl;

import com.example.demo.dto.request.user.UpdateUserProfileRequest;
import com.example.demo.dto.request.user.UpdateUserStatusRequest;
import com.example.demo.dto.response.user.UserAdminResponse;
import com.example.demo.dto.response.user.UserProfileResponse;
import com.example.demo.entity.auth.User;
import com.example.demo.enums.auth.UserRole;
import com.example.demo.enums.auth.UserStatus;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.auth.RefreshTokenRepository;
import com.example.demo.repository.auth.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail("hung@example.com");
        mockUser.setPasswordHash("hashed_password");
        mockUser.setFullName("Nguyen Duy Hung");
        mockUser.setPhone("0912345678");
        mockUser.setAddress("Ha Noi");
        mockUser.setAvatarUrl("https://example.com/avatar.jpg");
        mockUser.setRole(UserRole.USER);
        mockUser.setStatus(UserStatus.ACTIVE);
        mockUser.setCreatedAt(OffsetDateTime.now());
        mockUser.setUpdatedAt(OffsetDateTime.now());
    }

    @Test
    @DisplayName("Lấy profile thành công theo userId")
    void getCurrentUserProfile_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        UserProfileResponse response = userService.getCurrentUserProfile(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("hung@example.com", response.getEmail());
        assertEquals("Nguyen Duy Hung", response.getFullName());
        assertEquals("0912345678", response.getPhone());
        assertEquals("Ha Noi", response.getAddress());
        assertEquals("USER", response.getRole());
        assertEquals("ACTIVE", response.getStatus());
        verify(userRepository).findById(1L);
    }

    @Test
    @DisplayName("Lấy profile ném ResourceNotFoundException khi không tìm thấy userId")
    void getCurrentUserProfile_NotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getCurrentUserProfile(99L));
        verify(userRepository).findById(99L);
    }

    @Test
    @DisplayName("Lấy profile thành công theo email")
    void getCurrentUserProfileByEmail_Success() {
        when(userRepository.findByEmail("hung@example.com")).thenReturn(Optional.of(mockUser));

        UserProfileResponse response = userService.getCurrentUserProfileByEmail("hung@example.com");

        assertNotNull(response);
        assertEquals("hung@example.com", response.getEmail());
        verify(userRepository).findByEmail("hung@example.com");
    }

    @Test
    @DisplayName("Cập nhật profile thành công với dữ liệu hợp lệ")
    void updateUserProfile_Success() {
        UpdateUserProfileRequest request = UpdateUserProfileRequest.builder()
                .fullName("Nguyen Duy Hung Updated")
                .phone("0987654321")
                .address("Da Nang")
                .avatarUrl("https://example.com/new-avatar.jpg")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserProfileResponse response = userService.updateUserProfile(1L, request);

        assertNotNull(response);
        assertEquals("Nguyen Duy Hung Updated", response.getFullName());
        assertEquals("0987654321", response.getPhone());
        assertEquals("Da Nang", response.getAddress());
        assertEquals("https://example.com/new-avatar.jpg", response.getAvatarUrl());
        verify(userRepository).findById(1L);
        verify(userRepository).save(mockUser);
    }

    @Test
    @DisplayName("Cập nhật profile ném ResourceNotFoundException khi userId không tồn tại")
    void updateUserProfile_UserNotFound() {
        UpdateUserProfileRequest request = UpdateUserProfileRequest.builder()
                .fullName("Test Name")
                .build();

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.updateUserProfile(99L, request));
        verify(userRepository).findById(99L);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Admin lấy danh sách users có phân trang thành công")
    void getAllUsers_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> page = new PageImpl<>(Collections.singletonList(mockUser));
        when(userRepository.findUsersWithFilters(eq("hung"), eq(UserRole.USER), eq(UserStatus.ACTIVE), eq(pageable)))
                .thenReturn(page);

        Page<UserAdminResponse> result = userService.getAllUsers("  hung  ", UserRole.USER, UserStatus.ACTIVE, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("hung@example.com", result.getContent().get(0).getEmail());
        verify(userRepository).findUsersWithFilters(eq("hung"), eq(UserRole.USER), eq(UserStatus.ACTIVE), eq(pageable));
    }

    @Test
    @DisplayName("Admin lấy chi tiết user theo ID thành công")
    void getUserById_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        UserAdminResponse response = userService.getUserById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("hung@example.com", response.getEmail());
        assertEquals("Nguyen Duy Hung", response.getFullName());
        verify(userRepository).findById(1L);
    }

    @Test
    @DisplayName("Admin lấy chi tiết user ném lỗi khi không tìm thấy ID")
    void getUserById_NotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getUserById(99L));
        verify(userRepository).findById(99L);
    }

    @Test
    @DisplayName("Admin khóa user thành công và thu hồi refresh token")
    void updateUserStatus_BlockUser_Success() {
        UpdateUserStatusRequest request = UpdateUserStatusRequest.builder()
                .status(UserStatus.BLOCKED)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserAdminResponse response = userService.updateUserStatus(1L, request, 999L);

        assertNotNull(response);
        assertEquals("BLOCKED", response.getStatus());
        verify(userRepository).save(mockUser);
        verify(refreshTokenRepository).deleteByUser(mockUser);
    }

    @Test
    @DisplayName("Admin tự khóa tài khoản của chính mình ném IllegalArgumentException")
    void updateUserStatus_SelfBlock_ThrowsException() {
        UpdateUserStatusRequest request = UpdateUserStatusRequest.builder()
                .status(UserStatus.BLOCKED)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.updateUserStatus(1L, request, 1L));

        assertEquals("Admin không thể tự khóa tài khoản của chính mình", ex.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Admin khóa tài khoản Admin khác ném IllegalArgumentException")
    void updateUserStatus_BlockOtherAdmin_ThrowsException() {
        mockUser.setRole(UserRole.ADMIN);
        UpdateUserStatusRequest request = UpdateUserStatusRequest.builder()
                .status(UserStatus.BLOCKED)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.updateUserStatus(1L, request, 999L));

        assertEquals("Không thể khóa tài khoản có vai trò Quản trị viên (ADMIN)", ex.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Admin cập nhật trạng thái ném lỗi khi user không tồn tại")
    void updateUserStatus_UserNotFound() {
        UpdateUserStatusRequest request = UpdateUserStatusRequest.builder()
                .status(UserStatus.BLOCKED)
                .build();

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> userService.updateUserStatus(99L, request, 1L));
        verify(userRepository).findById(99L);
    }
}
