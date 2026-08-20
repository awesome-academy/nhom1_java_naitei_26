package com.example.demo.repository;

import com.example.demo.entity.Product;
import com.example.demo.entity.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findAllByStatus(ProductStatus status);

    List<Product> findAllByCategoryIdAndStatus(Long categoryId, ProductStatus status);
}