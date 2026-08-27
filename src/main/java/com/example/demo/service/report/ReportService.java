package com.example.demo.service.report;

import com.example.demo.dto.response.report.RevenueReportResponse;

import java.time.LocalDate;

public interface ReportService {

    /**
     * Thống kê doanh thu theo khoảng thời gian. Truyền null cho from/to để dùng khoảng mặc định.
     */
    RevenueReportResponse getRevenueReport(LocalDate from, LocalDate to);

    /**
     * Tính lại báo cáo doanh thu của khoảng thời gian rồi gửi qua email cho quản trị viên.
     * Trả về chính số liệu vừa gửi để giao diện đối chiếu cho khớp.
     */
    RevenueReportResponse sendRevenueReportEmail(LocalDate from, LocalDate to);
}
