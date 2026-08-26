package com.example.demo.repository.product;

import com.example.demo.entity.product.ProductSuggestion;
import com.example.demo.enums.product.ProductType;
import com.example.demo.enums.product.SuggestionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductSuggestionRepository extends JpaRepository<ProductSuggestion, Long> {
    List<ProductSuggestion> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByStatus(SuggestionStatus status);

    /**
     * Lọc đề xuất theo trạng thái, phân loại và từ khoá (tên món / người gửi / mô tả).
     * Tham số nào để null (riêng keyword chấp nhận cả chuỗi rỗng) thì bỏ qua điều kiện đó.
     */
    @Query("SELECT s FROM ProductSuggestion s JOIN s.user u WHERE " +
           "(:status IS NULL OR s.status = :status) " +
           "AND (:type IS NULL OR s.type = :type) " +
           "AND (:keyword IS NULL OR :keyword = '' " +
           "OR LOWER(s.productName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR (s.description IS NOT NULL AND LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%'))))")
    Page<ProductSuggestion> findWithFilters(
            @Param("status") SuggestionStatus status,
            @Param("type") ProductType type,
            @Param("keyword") String keyword,
            Pageable pageable);
}
