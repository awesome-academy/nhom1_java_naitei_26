package com.example.demo.service;

import com.example.demo.dto.request.ProductRequest;
import com.example.demo.dto.response.ProductResponse;

import java.util.List;

public interface ProductService {

    List<ProductResponse> getAll(boolean includeInactive);

    ProductResponse getById(Long id, boolean includeInactive);

    ProductResponse create(ProductRequest request);

    ProductResponse update(Long id, ProductRequest request);

    ProductResponse delete(Long id);
}