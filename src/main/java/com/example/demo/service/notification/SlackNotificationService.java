package com.example.demo.service.notification;

public interface SlackNotificationService {

    /**
     * Gửi tin nhắn vào kênh Slack đã cấu hình qua Incoming Webhook.
     * Lỗi gửi (mất mạng, webhook sai...) chỉ được log lại, không throw ra ngoài
     * để không làm hỏng nghiệp vụ chính (vd tạo đơn hàng) gọi tới nó.
     */
    void sendMessage(String text);
}
