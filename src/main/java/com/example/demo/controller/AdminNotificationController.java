package com.example.demo.controller;

import com.example.demo.dto.request.notification.SlackTestMessageRequest;
import com.example.demo.dto.response.common.ApiResponse;
import com.example.demo.service.notification.SlackNotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
public class AdminNotificationController {

    private final SlackNotificationService slackNotificationService;

    /**
     * Endpoint tạm để kiểm tra Slack webhook đã cấu hình đúng chưa (TASK #99079).
     */
    @PostMapping("/test-slack")
    public ResponseEntity<ApiResponse<Void>> testSlack(@Valid @RequestBody SlackTestMessageRequest request) {
        slackNotificationService.sendMessage(request.getMessage());
        return ResponseEntity.ok(ApiResponse.ok("Đã gửi yêu cầu thông báo Slack", null));
    }
}
