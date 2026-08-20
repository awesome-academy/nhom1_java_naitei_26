package com.example.demo.dto.request.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TokenRefreshRequest {

    @NotBlank(message = "Refresh token không được để trống!")
    private String refreshToken;
}
