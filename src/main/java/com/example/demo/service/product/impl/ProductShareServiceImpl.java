package com.example.demo.service.product.impl;

import com.example.demo.dto.response.product.ProductShareResponse;
import com.example.demo.entity.product.Product;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.product.ProductRepository;
import com.example.demo.service.product.ProductShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductShareServiceImpl implements ProductShareService {

    private static final String FACEBOOK_SHARER_URL = "https://www.facebook.com/sharer/sharer.php?u=";
    private static final String TWITTER_INTENT_URL = "https://twitter.com/intent/tweet";

    private final ProductRepository productRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.frontend.product-path}")
    private String productPath;

    @Override
    public ProductShareResponse getShareLinks(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        String productUrl = buildProductUrl(product.getId());
        String encodedUrl = encode(productUrl);
        String encodedTitle = encode(product.getName());

        return ProductShareResponse.builder()
                .productId(product.getId())
                .productName(product.getName())
                .productUrl(productUrl)
                .facebookShareUrl(FACEBOOK_SHARER_URL + encodedUrl)
                .twitterShareUrl(TWITTER_INTENT_URL + "?url=" + encodedUrl + "&text=" + encodedTitle)
                .description(product.getDescription())
                .build();
    }

    /**
     * Ghép link trang chi tiết sản phẩm phía Frontend, bỏ dấu "/" thừa nếu có.
     */
    private String buildProductUrl(Long productId) {
        String baseUrl = frontendUrl.endsWith("/")
                ? frontendUrl.substring(0, frontendUrl.length() - 1)
                : frontendUrl;
        String path = productPath.startsWith("/") ? productPath : "/" + productPath;
        return baseUrl + path + "/" + productId;
    }

    /**
     * Encode theo chuẩn URL để tên sản phẩm có dấu tiếng Việt và khoảng trắng không làm hỏng link.
     */
    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
