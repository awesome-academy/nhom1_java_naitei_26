package com.example.demo.exception;

import com.example.demo.common.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Bắt lỗi 401 Unauthorized: Người dùng chưa đăng nhập hoặc Token không hợp lệ.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(AuthenticationException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(
                        HttpStatus.UNAUTHORIZED.value(),
                        "Unauthorized: Bạn cần đăng nhập hoặc Token không hợp lệ!"
                ));
    }

    /**
     * Bắt lỗi 403 Forbidden: Người dùng đã đăng nhập nhưng không đủ quyền truy cập tài nguyên.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(AccessDeniedException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(
                        HttpStatus.FORBIDDEN.value(),
                        "Forbidden: Bạn không có quyền truy cập vào tài nguyên này!"
                ));
    }
}
