package com.example.demo.exception;

import com.example.demo.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Bắt lỗi 403 Forbidden khi vi phạm @PreAuthorize
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDeniedException(AccessDeniedException ex) {
        log.error("AccessDeniedException: {}", ex.getMessage());

        ApiResponse<Object> response = ApiResponse.error(
                HttpStatus.FORBIDDEN.value(),
                "Forbidden: Bạn không có quyền truy cập vào tài nguyên này!"
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    /**
     * Bắt lỗi 401 Unauthorized khi chưa đăng nhập hoặc token không hợp lệ
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuthenticationException(AuthenticationException ex) {
        log.error("AuthenticationException: {}", ex.getMessage());

        ApiResponse<Object> response = ApiResponse.error(
                HttpStatus.UNAUTHORIZED.value(),
                "Unauthorized: Bạn cần đăng nhập hoặc Token không hợp lệ!"
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    /**
     * Bắt lỗi sai email hoặc mật khẩu
     */
    @ExceptionHandler({BadCredentialsException.class, UsernameNotFoundException.class})
    public ResponseEntity<ApiResponse<Object>> handleBadCredentialsException(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(
                        HttpStatus.UNAUTHORIZED.value(),
                        "Email hoặc mật khẩu không chính xác!"
                ));
    }

    /**
     * Bắt lỗi tài khoản bị khóa
     */
    @ExceptionHandler({DisabledException.class, LockedException.class})
    public ResponseEntity<ApiResponse<Object>> handleAccountDisabledException(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(
                        HttpStatus.FORBIDDEN.value(),
                        "Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động!"
                ));
    }

    /**
     * Bắt lỗi dữ liệu đầu vào không hợp lệ (@Valid)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationException(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(
                        HttpStatus.BAD_REQUEST.value(),
                        "Dữ liệu không hợp lệ: " + errorMessage
                ));
    }
}
