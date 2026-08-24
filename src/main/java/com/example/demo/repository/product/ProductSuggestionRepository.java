package com.example.demo.repository.product;

import com.example.demo.entity.product.ProductSuggestion;
import com.example.demo.enums.product.SuggestionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductSuggestionRepository extends JpaRepository<ProductSuggestion, Long> {
    List<ProductSuggestion> findByUserId(Long userId);

    Page<ProductSuggestion> findByStatus(SuggestionStatus status, Pageable pageable);
}
