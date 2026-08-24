package com.example.demo.service.user.impl;

import com.example.demo.dto.request.user.UpdateUserProfileRequest;
import com.example.demo.dto.response.user.UserProfileResponse;
import com.example.demo.entity.auth.User;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.auth.UserRepository;
import com.example.demo.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
        return mapToProfileResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfileByEmail(String email) {
        log.info("Lấy thông tin profile cho email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + email));
        return mapToProfileResponse(user);
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
        return mapToProfileResponse(savedUser);
    }

    private UserProfileResponse mapToProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
