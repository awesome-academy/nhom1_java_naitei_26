package com.example.demo.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private int status;
    private String message;
    private T data;
    private OffsetDateTime timestamp;

    public static <T> ApiResponse<T> ok(T data) {
        return ApiResponse.<T>builder()
                .status(200)
                .message("Success")
                .data(data)
                .timestamp(OffsetDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        return ApiResponse.<T>builder()
                .status(200)
                .message(message)
                .data(data)
                .timestamp(OffsetDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(int status, String message) {
        return ApiResponse.<T>builder()
                .status(status)
                .message(message)
                .timestamp(OffsetDateTime.now())
                .build();
    }
}
