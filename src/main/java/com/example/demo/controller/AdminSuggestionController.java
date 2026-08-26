package com.example.demo.controller;

import com.example.demo.dto.request.SuggestionStatusUpdateRequest;
import com.example.demo.dto.response.SuggestionAdminResponse;
import com.example.demo.dto.response.SuggestionStatsResponse;
import com.example.demo.dto.response.common.ApiResponse;
import com.example.demo.enums.product.ProductType;
import com.example.demo.enums.product.SuggestionStatus;
import com.example.demo.service.SuggestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Route nằm dưới /api/admin/** nên đã bị chặn chỉ cho ROLE_ADMIN ở SecurityConfig,
 * không cần khai báo thêm @PreAuthorize ở từng method.
 */
@RestController
@RequestMapping("/api/admin/suggestions")
@RequiredArgsConstructor
public class AdminSuggestionController {

    private final SuggestionService suggestionService;

    /**
     * API xem danh sách đề xuất sản phẩm từ người dùng (Admin), có lọc và phân trang.
     *
     * @param status  Trạng thái cần lọc (PENDING/APPROVED/REJECTED), bỏ trống để lấy tất cả
     * @param type    Phân loại cần lọc (FOOD/DRINK), bỏ trống để lấy tất cả
     * @param keyword Từ khoá tìm theo tên món / người gửi / mô tả, bỏ trống để không tìm
     * @param page    Số trang, mặc định 0
     * @param size    Số bản ghi mỗi trang, mặc định 10
     * @return ApiResponse bọc Page chứa danh sách đề xuất
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<SuggestionAdminResponse>>> getSuggestions(
            @RequestParam(required = false) SuggestionStatus status,
            @RequestParam(required = false) ProductType type,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<SuggestionAdminResponse> response = suggestionService.getSuggestions(status, type, keyword, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách đề xuất thành công", response));
    }

    /**
     * API đếm số đề xuất theo trạng thái (Admin), dùng cho thẻ thống kê và badge trên menu.
     *
     * @return ApiResponse bọc số liệu tổng / chờ duyệt / đã duyệt / từ chối
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<SuggestionStatsResponse>> getSuggestionStats() {
        SuggestionStatsResponse response = suggestionService.getSuggestionStats();
        return ResponseEntity.ok(ApiResponse.ok("Lấy thống kê đề xuất thành công", response));
    }

    /**
     * API duyệt hoặc từ chối một đề xuất sản phẩm (Admin).
     *
     * @param id      ID của đề xuất cần cập nhật
     * @param request DTO chứa trạng thái mới (APPROVED/REJECTED) và ghi chú của admin (nếu có)
     * @return ApiResponse bọc SuggestionAdminResponse sau khi cập nhật
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<SuggestionAdminResponse>> updateSuggestionStatus(
            @PathVariable Long id,
            @Valid @RequestBody SuggestionStatusUpdateRequest request) {
        SuggestionAdminResponse response = suggestionService.updateSuggestionStatus(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái đề xuất thành công", response));
    }
}
