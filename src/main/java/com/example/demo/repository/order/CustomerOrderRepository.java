package com.example.demo.repository.order;

import com.example.demo.entity.order.CustomerOrder;
import com.example.demo.enums.order.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
    List<CustomerOrder> findByUserId(Long userId);
    List<CustomerOrder> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<CustomerOrder> findByIdAndUserId(Long id, Long userId);
    List<CustomerOrder> findAllByOrderByCreatedAtDesc();

    /**
     * Tổng doanh thu của các đơn ở một trạng thái trong khoảng [start, end).
     * Trả về null nếu không có đơn nào khớp điều kiện.
     */
    @Query("SELECT SUM(o.totalAmount) FROM CustomerOrder o " +
           "WHERE o.status = :status AND o.createdAt >= :start AND o.createdAt < :end")
    BigDecimal sumRevenueByStatusAndPeriod(
            @Param("status") OrderStatus status,
            @Param("start") OffsetDateTime start,
            @Param("end") OffsetDateTime end);

    /**
     * Đếm số đơn ở một trạng thái trong khoảng [start, end).
     */
    @Query("SELECT COUNT(o) FROM CustomerOrder o " +
           "WHERE o.status = :status AND o.createdAt >= :start AND o.createdAt < :end")
    long countByStatusAndPeriod(
            @Param("status") OrderStatus status,
            @Param("start") OffsetDateTime start,
            @Param("end") OffsetDateTime end);
}

