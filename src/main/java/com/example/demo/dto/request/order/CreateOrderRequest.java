package com.example.demo.dto.request.order;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotBlank(message = "Recipient name is required")
    private String recipientName;

    @NotBlank(message = "Recipient phone is required")
    private String recipientPhone;

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;

    private String note;

    /**
     * Danh sách sản phẩm muốn đặt.
     * Nếu truyền null hoặc rỗng, hệ thống tự động tạo đơn từ giỏ hàng hiện tại của người dùng.
     */
    private List<OrderItemRequest> items;
}
