package com.example.demo.service.user.impl;

import com.example.demo.dto.request.user.UpdateUserProfileRequest;
import com.example.demo.dto.request.user.UpdateUserRoleRequest;
import com.example.demo.dto.request.user.UpdateUserStatusRequest;
import com.example.demo.dto.response.user.UserAdminResponse;
import com.example.demo.dto.response.user.UserProfileResponse;
import com.example.demo.entity.auth.User;
import com.example.demo.enums.auth.UserRole;
import com.example.demo.enums.auth.UserStatus;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.auth.RefreshTokenRepository;
import com.example.demo.repository.auth.UserRepository;
import com.example.demo.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(Long userId) {
        log.info("Lấy thông tin profile cho userId: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin người dùng với ID: " + userId));
        return UserProfileResponse.fromEntity(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfileByEmail(String email) {
        log.info("Lấy thông tin profile cho email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + email));
        return UserProfileResponse.fromEntity(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateUserProfile(Long userId, UpdateUserProfileRequest request) {
        log.info("Cập nhật thông tin profile cho userId: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin người dùng với ID: " + userId));

        user.setFullName(request.getFullName().trim());
        user.setPhone(request.getPhone() != null && !request.getPhone().isBlank() ? request.getPhone().trim() : null);
        user.setAddress(request.getAddress() != null && !request.getAddress().isBlank() ? request.getAddress().trim() : null);
        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }
        user.setUpdatedAt(java.time.OffsetDateTime.now());

        User savedUser = userRepository.save(user);
        log.info("Cập nhật profile thành công cho userId: {}", userId);
        return UserProfileResponse.fromEntity(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserAdminResponse> getAllUsers(String keyword, UserRole role, UserStatus status, Pageable pageable) {
        log.info("Admin lấy danh sách users: keyword={}, role={}, status={}, page={}, size={}", keyword, role, status, pageable.getPageNumber(), pageable.getPageSize());
        Page<User> usersPage = userRepository.findUsersWithFilters(keyword, role, status, pageable);
        return usersPage.map(UserAdminResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public UserAdminResponse getUserById(Long userId) {
        log.info("Admin lấy chi tiết user có ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        return UserAdminResponse.fromEntity(user);
    }

    @Override
    @Transactional
    public UserAdminResponse updateUserStatus(Long userId, UpdateUserStatusRequest request, Long currentAdminId) {
        log.info("Admin ID {} cập nhật trạng thái user ID {} thành {}", currentAdminId, userId, request.getStatus());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        if (userId.equals(currentAdminId) && request.getStatus() == UserStatus.BLOCKED) {
            throw new IllegalArgumentException("Admin không thể tự khóa tài khoản của chính mình");
        }

        user.setStatus(request.getStatus());
        User savedUser = userRepository.save(user);

        if (request.getStatus() == UserStatus.BLOCKED) {
            refreshTokenRepository.deleteByUser(savedUser);
            log.info("Đã thu hồi toàn bộ refreshToken của user ID {}", userId);
        }

        return UserAdminResponse.fromEntity(savedUser);
    }

    @Override
    @Transactional
    public UserAdminResponse updateUserRole(Long userId, UpdateUserRoleRequest request, Long currentAdminId) {
        log.info("Admin ID {} cập nhật vai trò user ID {} thành {}", currentAdminId, userId, request.getRole());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        if (userId.equals(currentAdminId) && request.getRole() != UserRole.ADMIN) {
            throw new IllegalArgumentException("Admin không thể tự thay đổi vai trò của chính mình");
        }

        user.setRole(request.getRole());
        User savedUser = userRepository.save(user);

        return UserAdminResponse.fromEntity(savedUser);
    }
}
