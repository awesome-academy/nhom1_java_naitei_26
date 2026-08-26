package com.example.demo.service.order;

import com.example.demo.dto.request.order.BuyNowRequest;
import com.example.demo.dto.request.order.CreateOrderRequest;
import com.example.demo.dto.response.order.OrderResponse;
import com.example.demo.entity.order.CustomerOrder;

import java.util.List;

public interface OrderService {

    OrderResponse createOrder(Long userId, CreateOrderRequest request);

    OrderResponse buyNow(Long userId, BuyNowRequest request);

    OrderResponse getOrderById(Long orderId);

    OrderResponse getOrderByIdAndUserId(Long orderId, Long userId);

    List<OrderResponse> getOrdersByUserId(Long userId);

    List<OrderResponse> getAllOrders();

    OrderResponse updateOrderStatus(Long orderId, String status);

    OrderResponse mapToOrderResponse(CustomerOrder order);
}
