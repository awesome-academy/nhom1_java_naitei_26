package com.example.demo.service.notification.impl;

import com.example.demo.service.notification.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationServiceImpl implements EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${app.notification.admin-email:}")
    private String adminEmail;

    @Override
    public void sendMessage(String subject, String body) {
        if (isNotConfigured()) {
            log.warn("Bỏ qua gửi email: chưa cấu hình app.notification.admin-email (biến môi trường ADMIN_NOTIFICATION_EMAIL)");
            return;
        }

        try {
            doSend(subject, body);
        } catch (Exception e) {
            log.error("Gửi thông báo email thất bại: {}", e.getMessage(), e);
        }
    }

    @Override
    public void sendMessageOrThrow(String subject, String body) {
        if (isNotConfigured()) {
            throw new IllegalStateException(
                    "Chưa cấu hình email nhận báo cáo (biến môi trường ADMIN_NOTIFICATION_EMAIL).");
        }

        try {
            doSend(subject, body);
        } catch (Exception e) {
            log.error("Gửi email thất bại: {}", e.getMessage(), e);
            throw new IllegalStateException("Gửi email thất bại: " + e.getMessage(), e);
        }
    }

    private boolean isNotConfigured() {
        return adminEmail == null || adminEmail.isBlank();
    }

    private void doSend(String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(adminEmail);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}
