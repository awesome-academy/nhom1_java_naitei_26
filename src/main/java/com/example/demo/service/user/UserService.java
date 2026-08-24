package com.example.demo.service.user;

import com.example.demo.dto.response.user.UserProfileResponse;

public interface UserService {

    /**
     * Lấy thông tin hồ sơ của User hiện tại dựa trên userId trích xuất từ token/Security Context.
     *
     * @param userId ID của người dùng
     * @return UserProfileResponse chứa thông tin hồ sơ
     */
    UserProfileResponse getCurrentUserProfile(Long userId);

    /**
     * Lấy thông tin hồ sơ của User dựa trên email.
     *
     * @param email Email của người dùng
     * @return UserProfileResponse chứa thông tin hồ sơ
     */
    UserProfileResponse getCurrentUserProfileByEmail(String email);
}
