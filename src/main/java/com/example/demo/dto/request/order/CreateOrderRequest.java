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
     * Danh sách ID của các món hàng trong giỏ hàng (CartItem ID) được tích chọn để đặt.
     */
    private List<Long> cartItemIds;

    /**
     * Danh sách các món hàng tích chọn kèm số lượng cập nhật khi checkout.
     */
    private List<SelectedCartItemRequest> cartItems;

    /**
     * Danh sách sản phẩm đặt trực tiếp (productId + quantity).
     * Nếu truyền null hoặc rỗng, hệ thống sẽ ưu tiên tạo đơn từ các món được tích chọn trong giỏ hàng.
     */
    private List<OrderItemRequest> items;
}
