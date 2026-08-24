package com.example.demo.service.user.impl;

import com.example.demo.dto.response.user.UserProfileResponse;
import com.example.demo.entity.auth.User;
import com.example.demo.enums.auth.UserRole;
import com.example.demo.enums.auth.UserStatus;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.auth.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private User sampleUser;

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
    }

    @Test
    @DisplayName("Lấy profile thành công khi User ID tồn tại")
    void getCurrentUserProfile_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        UserProfileResponse response = userService.getCurrentUserProfile(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("hung@example.com", response.getEmail());
        assertEquals("Nguyen Duy Hung", response.getFullName());
        assertEquals("0987654321", response.getPhone());
        assertEquals("Hanoi, Vietnam", response.getAddress());
        assertEquals("https://example.com/avatar.jpg", response.getAvatarUrl());
        assertEquals("USER", response.getRole());
        assertEquals("ACTIVE", response.getStatus());

        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Ném ResourceNotFoundException khi User ID không tồn tại")
    void getCurrentUserProfile_NotFound_ThrowsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getCurrentUserProfile(99L));
        verify(userRepository, times(1)).findById(99L);
    }

    @Test
    @DisplayName("Lấy profile thành công khi Email tồn tại")
    void getCurrentUserProfileByEmail_Success() {
        when(userRepository.findByEmail("hung@example.com")).thenReturn(Optional.of(sampleUser));

        UserProfileResponse response = userService.getCurrentUserProfileByEmail("hung@example.com");

        assertNotNull(response);
        assertEquals("hung@example.com", response.getEmail());
        verify(userRepository, times(1)).findByEmail("hung@example.com");
    }
}
