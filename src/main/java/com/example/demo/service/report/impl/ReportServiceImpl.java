package com.example.demo.service.report.impl;

import com.example.demo.dto.response.report.RevenueReportResponse;
import com.example.demo.enums.order.OrderStatus;
import com.example.demo.repository.order.CustomerOrderRepository;
import com.example.demo.service.notification.EmailNotificationService;
import com.example.demo.service.report.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

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

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final Locale VIETNAM_LOCALE = Locale.forLanguageTag("vi-VN");

    private final CustomerOrderRepository orderRepository;
    private final EmailNotificationService emailNotificationService;

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

    @Override
    @Transactional(readOnly = true)
    public RevenueReportResponse sendRevenueReportEmail(LocalDate from, LocalDate to) {
        // Luôn truy vấn lại DB theo khoảng ngày thay vì nhận sẵn con số từ client gửi lên,
        // để nội dung email không thể bị sửa lệch so với dữ liệu thật.
        RevenueReportResponse report = getRevenueReport(from, to);

        String subject = String.format("[Foods & Drinks] Báo cáo doanh thu %s - %s",
                report.getFromDate().format(DATE_FORMATTER),
                report.getToDate().format(DATE_FORMATTER));

        emailNotificationService.sendMessageOrThrow(subject, buildReportBody(report));

        return report;
    }

    private String buildReportBody(RevenueReportResponse report) {
        StringBuilder body = new StringBuilder();
        body.append("Báo cáo doanh thu cửa hàng Foods & Drinks.\n\n");
        body.append("Khoảng thời gian: ")
                .append(report.getFromDate().format(DATE_FORMATTER))
                .append(" - ")
                .append(report.getToDate().format(DATE_FORMATTER))
                .append("\n");
        body.append("Tổng doanh thu: ").append(formatCurrency(report.getTotalRevenue())).append("\n");
        body.append("Số đơn hoàn thành: ").append(report.getTotalOrders()).append("\n");
        body.append("\nGhi chú: chỉ đơn ở trạng thái ").append(REVENUE_STATUS)
                .append(" mới được tính vào doanh thu.");
        return body.toString();
    }

    private String formatCurrency(BigDecimal amount) {
        return NumberFormat.getInstance(VIETNAM_LOCALE).format(amount) + " đ";
    }
}
