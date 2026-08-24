package com.example.demo.service.user.impl;

import com.example.demo.dto.request.user.UpdateUserProfileRequest;
import com.example.demo.dto.response.user.UserAdminResponse;
import com.example.demo.dto.response.user.UserProfileResponse;
import com.example.demo.entity.auth.User;
import com.example.demo.enums.auth.UserRole;
import com.example.demo.enums.auth.UserStatus;
import com.example.demo.exception.ResourceNotFoundException;
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
        user.setAvatarUrl(request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank() ? request.getAvatarUrl().trim() : null);

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
}
