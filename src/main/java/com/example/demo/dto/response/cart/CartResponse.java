package com.example.demo.dto.response.cart;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {

    private Long cartId;               // ID của Giỏ hàng
    private Long userId;               // ID của Người dùng sở hữu
    private List<CartItemResponse> items; // Danh sách các món ăn trong giỏ
    private BigDecimal totalAmount;    // Tổng tiền của toàn bộ giỏ hàng
}
