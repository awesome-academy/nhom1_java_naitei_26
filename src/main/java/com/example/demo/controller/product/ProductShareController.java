package com.example.demo.controller.product;

import com.example.demo.dto.response.common.ApiResponse;
import com.example.demo.dto.response.product.ProductShareResponse;
import com.example.demo.service.product.ProductShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductShareController {

    private final ProductShareService productShareService;

    /**
     * API sinh link chia sẻ mạng xã hội cho một sản phẩm (Public, không cần đăng nhập).
     * Trả về link chia sẻ Facebook, X (Twitter) và link trang sản phẩm để copy.
     *
     * @param id ID của sản phẩm cần chia sẻ
     * @return ApiResponse bọc ProductShareResponse chứa các link chia sẻ
     */
    @GetMapping("/{id}/share")
    public ResponseEntity<ApiResponse<ProductShareResponse>> getShareLinks(@PathVariable Long id) {
        ProductShareResponse response = productShareService.getShareLinks(id);
        return ResponseEntity.ok(ApiResponse.ok("Lấy link chia sẻ sản phẩm thành công", response));
    }
}
