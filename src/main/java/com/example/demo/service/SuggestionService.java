package com.example.demo.service;

import com.example.demo.dto.request.SuggestionRequest;
import com.example.demo.dto.response.SuggestionResponse;

public interface SuggestionService {

    /**
     * Tạo đề xuất sản phẩm mới từ người dùng.
     *
     * @param userId  ID của người dùng đang đăng nhập (lấy từ token)
     * @param request DTO chứa tên sản phẩm, loại (FOOD/DRINK) và mô tả
     * @return SuggestionResponse của đề xuất vừa tạo, trạng thái mặc định PENDING
     */
    SuggestionResponse createSuggestion(Long userId, SuggestionRequest request);
}
