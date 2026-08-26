package com.example.demo.service.report;

import com.example.demo.dto.response.report.RevenueReportResponse;

import java.time.LocalDate;

public interface ReportService {

    /**
     * Thống kê doanh thu theo khoảng thời gian. Truyền null cho from/to để dùng khoảng mặc định.
     */
    RevenueReportResponse getRevenueReport(LocalDate from, LocalDate to);
}
