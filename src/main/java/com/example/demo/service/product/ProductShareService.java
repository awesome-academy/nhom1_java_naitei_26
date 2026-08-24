package com.example.demo.service.product;

import com.example.demo.dto.response.product.ProductShareResponse;

public interface ProductShareService {

    /**
     * Sinh các link chia sẻ mạng xã hội cho một sản phẩm.
     *
     * @param productId ID của sản phẩm cần chia sẻ
     * @return ProductShareResponse gồm link trang sản phẩm, link chia sẻ Facebook và X (Twitter)
     */
    ProductShareResponse getShareLinks(Long productId);
}
