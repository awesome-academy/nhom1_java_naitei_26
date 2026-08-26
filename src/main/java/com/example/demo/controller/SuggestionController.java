package com.example.demo.controller;

import com.example.demo.config.security.CustomUserDetails;
import com.example.demo.dto.request.SuggestionRequest;
import com.example.demo.dto.response.common.ApiResponse;
import com.example.demo.dto.response.SuggestionResponse;
import com.example.demo.service.SuggestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/suggestions")
@RequiredArgsConstructor
public class SuggestionController {

    private final SuggestionService suggestionService;

    /**
     * API gửi đề xuất thực phẩm/đồ uống mới tới quản trị viên (Authenticated User).
     * Tự động lấy userId từ token JWT đã được xác thực trong Spring Security.
     * @param userDetails Đối tượng chứa thông tin User đang đăng nhập
     * @param request     DTO chứa productName, type (FOOD/DRINK) và description
     * @return ApiResponse bọc SuggestionResponse của đề xuất vừa tạo
     */
    @PostMapping
    public ResponseEntity<ApiResponse<SuggestionResponse>> createSuggestion(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody SuggestionRequest request) {
        Long userId = userDetails.getUser().getId();
        SuggestionResponse response = suggestionService.createSuggestion(userId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Gửi đề xuất sản phẩm thành công", response));
    }

    /**
     * API xem lại các đề xuất do chính mình đã gửi kèm trạng thái duyệt và ghi chú của admin.
     * GET /api/suggestions/my
     *
     * @param userDetails Đối tượng chứa thông tin User đang đăng nhập
     * @return ApiResponse bọc danh sách đề xuất của người dùng, mới nhất lên đầu
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<SuggestionResponse>>> getMySuggestions(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        List<SuggestionResponse> response = suggestionService.getMySuggestions(userId);
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách đề xuất của bạn thành công", response));
    }
}
