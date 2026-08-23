package com.example.demo.service.order;

import com.example.demo.dto.request.order.CreateOrderRequest;
import com.example.demo.dto.response.order.OrderResponse;
import com.example.demo.entity.order.CustomerOrder;

import java.util.List;

public interface OrderService {

    /**
     * Tạo đơn hàng mới cho người dùng.
     *
     * @param userId ID của người dùng đặt hàng
     * @param request Thông tin nhận hàng và danh sách sản phẩm
     * @return OrderResponse chi tiết đơn hàng vừa tạo
     */
    OrderResponse createOrder(Long userId, CreateOrderRequest request);

    /**
     * Lấy thông tin đơn hàng theo ID.
     *
     * @param orderId ID của đơn hàng
     * @return OrderResponse thông tin đơn hàng
     */
    OrderResponse getOrderById(Long orderId);

    /**
     * Lấy thông tin đơn hàng theo ID và đảm bảo thuộc về người dùng.
     *
     * @param orderId ID của đơn hàng
     * @param userId ID của người dùng
     * @return OrderResponse thông tin đơn hàng
     */
    OrderResponse getOrderByIdAndUserId(Long orderId, Long userId);

    /**
     * Lấy danh sách tất cả đơn hàng của một người dùng.
     *
     * @param userId ID của người dùng
     * @return Danh sách OrderResponse
     */
    List<OrderResponse> getOrdersByUserId(Long userId);

    /**
     * Lấy danh sách tất cả đơn hàng trong hệ thống (dành cho Admin).
     *
     * @return Danh sách OrderResponse
     */
    List<OrderResponse> getAllOrders();

    /**
     * Cập nhật trạng thái đơn hàng.
     *
     * @param orderId ID đơn hàng
     * @param status Trạng thái mới (ví dụ: CANCELLED, DELIVERED...)
     * @return OrderResponse đơn hàng sau khi cập nhật
     */
    OrderResponse updateOrderStatus(Long orderId, String status);

    /**
     * Chuyển đổi đối tượng CustomerOrder thành OrderResponse DTO.
     *
     * @param order Đối tượng CustomerOrder
     * @return OrderResponse DTO
     */
    OrderResponse mapToOrderResponse(CustomerOrder order);
}
