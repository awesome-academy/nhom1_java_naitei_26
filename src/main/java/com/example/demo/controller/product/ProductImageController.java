package com.example.demo.controller.product;

import com.example.demo.dto.response.product.ProductImageResponse;
import com.example.demo.service.product.ProductImageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/product-images")
@RequiredArgsConstructor
public class ProductImageController {

    private final ProductImageService productImageService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductImageResponse> createProductImage(
            @RequestParam Long productId,
            @RequestParam String imageUrl,
            @RequestParam Boolean isPrimary,
            @RequestParam Integer displayOrder) {
        ProductImageResponse response = productImageService.createProductImage(productId, imageUrl, isPrimary, displayOrder);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/primary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductImageResponse> getPrimaryProductImage(@RequestParam Long productId) {
        ProductImageResponse response = productImageService.getPrimaryProductImage(productId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductImageResponse>> getProductImages(@RequestParam Long productId) {
        List<ProductImageResponse> response = productImageService.getProductImagesByProductId(productId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{imageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProductImage(@PathVariable Long imageId) {
        productImageService.deleteProductImage(imageId);
        return ResponseEntity.noContent().build();
    }

}
