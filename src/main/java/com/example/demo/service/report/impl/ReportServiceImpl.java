package com.example.demo.service.report.impl;

import com.example.demo.dto.response.report.RevenueReportResponse;
import com.example.demo.enums.order.OrderStatus;
import com.example.demo.repository.order.CustomerOrderRepository;
import com.example.demo.service.report.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    // Mốc ngày phải cắt theo giờ Việt Nam: DB chạy theo UTC nên đơn đặt lúc 06:00 ngày 01/08 giờ VN
    // được lưu thành 23:00 ngày 31/07 UTC, nếu cắt theo UTC sẽ bị tính nhầm sang ngày hôm trước.
    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    // Khoảng mặc định khi client không truyền from/to.
    private static final int DEFAULT_RANGE_DAYS = 30;

    // Chỉ đơn đã hoàn thành mới được tính là doanh thu thực thu.
    private static final OrderStatus REVENUE_STATUS = OrderStatus.COMPLETED;

    private final CustomerOrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public RevenueReportResponse getRevenueReport(LocalDate from, LocalDate to) {
        LocalDate toDate = to != null ? to : LocalDate.now(VIETNAM_ZONE);
        LocalDate fromDate = from != null ? from : toDate.minusDays(DEFAULT_RANGE_DAYS - 1L);

        if (fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException("Ngày bắt đầu không được sau ngày kết thúc");
        }

        // Khoảng nửa mở [start, end) để lấy trọn ngày kết thúc mà không cần biết tháng có bao nhiêu ngày.
        OffsetDateTime start = fromDate.atStartOfDay(VIETNAM_ZONE).toOffsetDateTime();
        OffsetDateTime end = toDate.plusDays(1).atStartOfDay(VIETNAM_ZONE).toOffsetDateTime();

        BigDecimal totalRevenue = orderRepository.sumRevenueByStatusAndPeriod(REVENUE_STATUS, start, end);
        long totalOrders = orderRepository.countByStatusAndPeriod(REVENUE_STATUS, start, end);

        return RevenueReportResponse.builder()
                .fromDate(fromDate)
                .toDate(toDate)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .totalOrders(totalOrders)
                .build();
    }
}
