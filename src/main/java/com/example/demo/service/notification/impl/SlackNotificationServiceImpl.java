package com.example.demo.service.notification.impl;

import com.example.demo.service.notification.SlackNotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
public class SlackNotificationServiceImpl implements SlackNotificationService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.slack.webhook-url:}")
    private String webhookUrl;

    @Override
    public void sendMessage(String text) {
        if (webhookUrl == null || webhookUrl.isBlank()) {
            log.warn("Bỏ qua gửi Slack: chưa cấu hình app.slack.webhook-url (biến môi trường SLACK_WEBHOOK_URL)");
            return;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> request = new HttpEntity<>(Map.of("text", text), headers);
            restTemplate.postForEntity(webhookUrl, request, String.class);
        } catch (Exception e) {
            log.error("Gửi thông báo Slack thất bại: {}", e.getMessage(), e);
        }
    }
}
