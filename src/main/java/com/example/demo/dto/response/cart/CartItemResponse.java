package com.example.demo.dto.response.cart;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {

    private Long id;              // ID của CartItem
    private Long productId;       // ID của Sản phẩm
    private String productName;   // Tên sản phẩm
    private String productImageUrl;// Đường dẫn hình ảnh sản phẩm (ảnh chính)
    private BigDecimal price;     // Đơn giá hiện tại
    private Integer quantity;     // Số lượng đặt mua
    private BigDecimal subtotal;  // Thành tiền = price * quantity
    private Integer stockQuantity;// Số lượng tồn kho hiện tại
}
