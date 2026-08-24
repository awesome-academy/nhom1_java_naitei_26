package com.example.demo.dto.response.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductShareResponse {

    private Long productId;
    private String productName;

    /**
     * Link trang chi tiết sản phẩm phía Frontend, dùng cho chức năng "Copy link".
     */
    private String productUrl;

    private String facebookShareUrl;
    private String twitterShareUrl;

    /**
     * Mô tả sản phẩm, Frontend dùng làm nội dung kèm theo khi chia sẻ.
     */
    private String description;
}
