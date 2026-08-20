package com.example.demo.repository;

import com.example.demo.entity.Category;
import com.example.demo.entity.CategoryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByStatus(CategoryStatus status);

    boolean existsByNameIgnoreCaseAndStatus(String name, CategoryStatus status);

    boolean existsByNameIgnoreCaseAndIdNotAndStatus(String name, Long id, CategoryStatus status);
}