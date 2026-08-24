package com.example.demo.service.user;

import com.example.demo.dto.request.user.UpdateUserProfileRequest;
import com.example.demo.dto.response.user.UserProfileResponse;

public interface UserService {

    UserProfileResponse getCurrentUserProfile(Long userId);

    UserProfileResponse getCurrentUserProfileByEmail(String email);

    UserProfileResponse updateUserProfile(Long userId, UpdateUserProfileRequest request);
}
