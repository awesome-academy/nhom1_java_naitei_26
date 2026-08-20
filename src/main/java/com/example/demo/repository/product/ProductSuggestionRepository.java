package com.example.demo.repository.product;

import com.example.demo.entity.product.ProductSuggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductSuggestionRepository extends JpaRepository<ProductSuggestion, Long> {
    List<ProductSuggestion> findByUserId(Long userId);
}
