package com.example.demo.service;

import com.example.demo.dto.request.SuggestionRequest;
import com.example.demo.dto.request.SuggestionStatusUpdateRequest;
import com.example.demo.dto.response.SuggestionAdminResponse;
import com.example.demo.dto.response.SuggestionResponse;
import com.example.demo.dto.response.SuggestionStatsResponse;
import com.example.demo.enums.product.ProductType;
import com.example.demo.enums.product.SuggestionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

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
     * Lấy các đề xuất do chính người dùng đã gửi, mới nhất lên đầu, kèm trạng thái
     * và ghi chú của admin để họ biết đề xuất được duyệt hay bị từ chối.
     *
     * @param userId ID của người dùng đang đăng nhập (lấy từ token)
     * @return danh sách đề xuất của riêng người dùng đó
     */
    List<SuggestionResponse> getMySuggestions(Long userId);

    /**
     * Lấy danh sách đề xuất sản phẩm cho Admin, có lọc và phân trang.
     *
     * @param status   Trạng thái cần lọc, để null nếu muốn lấy tất cả
     * @param type     Phân loại FOOD/DRINK cần lọc, để null nếu muốn lấy tất cả
     * @param keyword  Từ khoá tìm theo tên món / người gửi / mô tả, để null hoặc rỗng nếu không tìm
     * @param pageable Thông tin phân trang, sắp xếp
     * @return Page chứa danh sách đề xuất kèm thông tin người gửi
     */
    Page<SuggestionAdminResponse> getSuggestions(SuggestionStatus status, ProductType type, String keyword, Pageable pageable);

    /**
     * Đếm số đề xuất theo từng trạng thái, dùng cho thẻ thống kê và badge trên menu quản trị.
     */
    SuggestionStatsResponse getSuggestionStats();

    /**
     * Duyệt hoặc từ chối một đề xuất sản phẩm (Admin).
     *
     * @param suggestionId ID của đề xuất cần cập nhật
     * @param request      DTO chứa trạng thái mới và ghi chú của admin (nếu có)
     * @return SuggestionAdminResponse sau khi cập nhật
     */
    SuggestionAdminResponse updateSuggestionStatus(Long suggestionId, SuggestionStatusUpdateRequest request);
}
