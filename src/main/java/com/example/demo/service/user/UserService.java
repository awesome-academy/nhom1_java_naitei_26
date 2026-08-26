package com.example.demo.service.user;

import com.example.demo.dto.request.user.UpdateUserProfileRequest;
import com.example.demo.dto.request.user.UpdateUserRoleRequest;
import com.example.demo.dto.request.user.UpdateUserStatusRequest;
import com.example.demo.dto.response.user.UserAdminResponse;
import com.example.demo.dto.response.user.UserProfileResponse;
import com.example.demo.enums.auth.UserRole;
import com.example.demo.enums.auth.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {

    UserProfileResponse getCurrentUserProfile(Long userId);

    UserProfileResponse getCurrentUserProfileByEmail(String email);

    UserProfileResponse updateUserProfile(Long userId, UpdateUserProfileRequest request);

    Page<UserAdminResponse> getAllUsers(String keyword, UserRole role, UserStatus status, Pageable pageable);

    UserAdminResponse getUserById(Long userId);

    UserAdminResponse updateUserStatus(Long userId, UpdateUserStatusRequest request, Long currentAdminId);

    UserAdminResponse updateUserRole(Long userId, UpdateUserRoleRequest request, Long currentAdminId);
}
