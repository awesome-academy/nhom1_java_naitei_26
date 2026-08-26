package com.example.demo.controller.report;

import com.example.demo.dto.response.common.ApiResponse;
import com.example.demo.dto.response.report.RevenueReportResponse;
import com.example.demo.service.report.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminReportController {

    private final ReportService reportService;

    /**
     * API Admin thống kê doanh thu theo khoảng thời gian tự chọn.
     * GET /api/admin/reports/revenue?from=2026-07-28&to=2026-08-26
     * Bỏ trống from/to sẽ lấy 30 ngày gần nhất.
     */
    @GetMapping("/revenue")
    public ApiResponse<RevenueReportResponse> getRevenueReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        RevenueReportResponse response = reportService.getRevenueReport(from, to);
        return ApiResponse.ok("Lấy báo cáo doanh thu thành công", response);
    }
}
