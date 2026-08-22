package com.example.demo.repository.product;

import com.example.demo.entity.product.Product;
import com.example.demo.enums.product.ProductStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsByNameIgnoreCase(String name);
    List<Product> findByStatus(ProductStatus status);
}
