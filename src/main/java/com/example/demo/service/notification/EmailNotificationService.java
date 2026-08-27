package com.example.demo.service.notification;

public interface EmailNotificationService {

    /**
     * Gửi email, lỗi chỉ ghi log chứ không ném ra ngoài để không chặn luồng nghiệp vụ
     * đang chạy (dùng cho thông báo tự động, ví dụ khi có đơn hàng mới).
     */
    void sendMessage(String subject, String body);

    /**
     * Gửi email và ném lỗi nếu thất bại, dùng cho thao tác quản trị viên chủ động bấm
     * và cần biết kết quả thật để báo lại trên giao diện.
     */
    void sendMessageOrThrow(String subject, String body);
}
