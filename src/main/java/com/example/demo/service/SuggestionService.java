package com.example.demo.service;

import com.example.demo.dto.request.SuggestionRequest;
import com.example.demo.dto.request.SuggestionStatusUpdateRequest;
import com.example.demo.dto.response.SuggestionAdminResponse;
import com.example.demo.dto.response.SuggestionResponse;
import com.example.demo.enums.product.SuggestionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SuggestionService {

    /**
     * Tạo đề xuất sản phẩm mới từ người dùng.
     *
     * @param userId  ID của người dùng đang đăng nhập (lấy từ token)
     * @param request DTO chứa tên sản phẩm, loại (FOOD/DRINK) và mô tả
     * @return SuggestionResponse của đề xuất vừa tạo, trạng thái mặc định PENDING
     */
    SuggestionResponse createSuggestion(Long userId, SuggestionRequest request);

    /**
     * Lấy danh sách đề xuất sản phẩm cho Admin, có lọc theo trạng thái và phân trang.
     *
     * @param status   Trạng thái cần lọc, để null nếu muốn lấy tất cả
     * @param pageable Thông tin phân trang, sắp xếp
     * @return Page chứa danh sách đề xuất kèm thông tin người gửi
     */
    Page<SuggestionAdminResponse> getSuggestions(SuggestionStatus status, Pageable pageable);

    /**
     * Duyệt hoặc từ chối một đề xuất sản phẩm (Admin).
     *
     * @param suggestionId ID của đề xuất cần cập nhật
     * @param request      DTO chứa trạng thái mới và ghi chú của admin (nếu có)
     * @return SuggestionAdminResponse sau khi cập nhật
     */
    SuggestionAdminResponse updateSuggestionStatus(Long suggestionId, SuggestionStatusUpdateRequest request);
}
