package com.example.demo.repository.order;

import com.example.demo.entity.order.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
    List<CustomerOrder> findByUserId(Long userId);
    List<CustomerOrder> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<CustomerOrder> findByIdAndUserId(Long id, Long userId);
    List<CustomerOrder> findAllByOrderByCreatedAtDesc();
}

