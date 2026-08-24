package com.example.demo.service.order.impl;

import com.example.demo.dto.request.order.CreateOrderRequest;
import com.example.demo.dto.request.order.OrderItemRequest;
import com.example.demo.dto.request.order.SelectedCartItemRequest;
import com.example.demo.dto.response.order.OrderItemResponse;
import com.example.demo.dto.response.order.OrderResponse;
import com.example.demo.entity.auth.User;
import com.example.demo.entity.cart.CartItem;
import com.example.demo.entity.order.CustomerOrder;
import com.example.demo.entity.order.OrderItem;
import com.example.demo.entity.product.Product;
import com.example.demo.enums.order.OrderStatus;
import com.example.demo.enums.product.ProductStatus;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.auth.UserRepository;
import com.example.demo.repository.cart.CartItemRepository;
import com.example.demo.repository.order.CustomerOrderRepository;
import com.example.demo.repository.product.ProductRepository;
import com.example.demo.service.cart.CartService;
import com.example.demo.service.order.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final CustomerOrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository;
    private final CartService cartService;

    @Override
    @Transactional
    public OrderResponse createOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        CustomerOrder order = new CustomerOrder();
        order.setUser(user);
        order.setRecipientName(request.getRecipientName());
        order.setRecipientPhone(request.getRecipientPhone());
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setNote(request.getNote());
        order.setStatus(OrderStatus.PENDING);

        BigDecimal totalAmount = BigDecimal.ZERO;

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            // Trường hợp 1: Tạo đơn hàng từ danh sách sản phẩm đặt trực tiếp
            for (OrderItemRequest itemReq : request.getItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemReq.getProductId()));

                validateProductAvailability(product, itemReq.getQuantity());

                BigDecimal unitPrice = product.getPrice();
                BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));

                OrderItem orderItem = createOrderItem(product, itemReq.getQuantity(), unitPrice, subtotal);
                order.addItem(orderItem);
                totalAmount = totalAmount.add(subtotal);

                deductProductStock(product, itemReq.getQuantity());
            }
        } else if (request.getCartItems() != null && !request.getCartItems().isEmpty()) {
            // Trường hợp 2: Tích chọn sản phẩm trong giỏ VÀ cập nhật số lượng khi checkout
            Map<Long, Integer> quantityMap = new HashMap<>();
            List<Long> cartItemIds = new ArrayList<>();

            for (SelectedCartItemRequest item : request.getCartItems()) {
                cartItemIds.add(item.getCartItemId());
                if (item.getQuantity() != null && item.getQuantity() > 0) {
                    quantityMap.put(item.getCartItemId(), item.getQuantity());
                }
            }

            List<CartItem> selectedItems = cartItemRepository.findByIdInAndCartUserId(cartItemIds, userId);
            if (selectedItems.isEmpty()) {
                throw new IllegalArgumentException("Không tìm thấy các sản phẩm đã chọn trong giỏ hàng");
            }

            for (CartItem cartItem : selectedItems) {
                int quantity = quantityMap.getOrDefault(cartItem.getId(), cartItem.getQuantity());
                Product product = cartItem.getProduct();

                validateProductAvailability(product, quantity);

                BigDecimal unitPrice = product.getPrice();
                BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

                OrderItem orderItem = createOrderItem(product, quantity, unitPrice, subtotal);
                order.addItem(orderItem);
                totalAmount = totalAmount.add(subtotal);

                deductProductStock(product, quantity);
            }

            // Xóa duy nhất các sản phẩm đã tích chọn khỏi giỏ hàng
            cartItemRepository.deleteAll(selectedItems);
        } else if (request.getCartItemIds() != null && !request.getCartItemIds().isEmpty()) {
            // Trường hợp 3: Tích chọn danh sách món trong giỏ hàng (giữ số lượng giỏ hàng hiện tại)
            List<CartItem> selectedItems = cartItemRepository.findByIdInAndCartUserId(request.getCartItemIds(), userId);
            if (selectedItems.isEmpty()) {
                throw new IllegalArgumentException("Không tìm thấy các sản phẩm đã chọn trong giỏ hàng");
            }

            for (CartItem cartItem : selectedItems) {
                Product product = cartItem.getProduct();
                int quantity = cartItem.getQuantity();

                validateProductAvailability(product, quantity);

                BigDecimal unitPrice = product.getPrice();
                BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

                OrderItem orderItem = createOrderItem(product, quantity, unitPrice, subtotal);
                order.addItem(orderItem);
                totalAmount = totalAmount.add(subtotal);

                deductProductStock(product, quantity);
            }

            // Xóa duy nhất các sản phẩm đã tích chọn khỏi giỏ hàng
            cartItemRepository.deleteAll(selectedItems);
        } else {
            // Trường hợp 4: Mặc định checkout toàn bộ giỏ hàng
            cartService.validateCart(userId);
            List<CartItem> cartItems = cartService.getCartItemsByUserId(userId);

            if (cartItems.isEmpty()) {
                throw new IllegalArgumentException("Giỏ hàng của người dùng đang rỗng");
            }

            for (CartItem cartItem : cartItems) {
                Product product = cartItem.getProduct();
                int quantity = cartItem.getQuantity();

                validateProductAvailability(product, quantity);

                BigDecimal unitPrice = product.getPrice();
                BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

                OrderItem orderItem = createOrderItem(product, quantity, unitPrice, subtotal);
                order.addItem(orderItem);
                totalAmount = totalAmount.add(subtotal);

                deductProductStock(product, quantity);
            }

            // Xóa sạch giỏ hàng
            cartService.clearCart(userId);
        }

        order.setTotalAmount(totalAmount);
        CustomerOrder savedOrder = orderRepository.save(order);

        return mapToOrderResponse(savedOrder);
    }

    private void validateProductAvailability(Product product, int quantity) {
        if (product == null) {
            throw new ResourceNotFoundException("Sản phẩm không tồn tại");
        }
        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new IllegalArgumentException("Sản phẩm '" + product.getName() + "' hiện ngưng hoạt động");
        }
        int currentStock = product.getStockQuantity() == null ? 0 : product.getStockQuantity();
        if (quantity > currentStock) {
            throw new IllegalArgumentException("Sản phẩm '" + product.getName() + "' vượt quá số lượng tồn kho (tồn: " + currentStock + ", yêu cầu: " + quantity + ")");
        }
    }

    private OrderItem createOrderItem(Product product, int quantity, BigDecimal unitPrice, BigDecimal subtotal) {
        OrderItem orderItem = new OrderItem();
        orderItem.setProduct(product);
        orderItem.setProductName(product.getName());
        orderItem.setQuantity(quantity);
        orderItem.setUnitPrice(unitPrice);
        orderItem.setSubtotal(subtotal);
        return orderItem;
    }

    private void deductProductStock(Product product, int quantity) {
        int currentStock = product.getStockQuantity() == null ? 0 : product.getStockQuantity();
        product.setStockQuantity(currentStock - quantity);
        productRepository.save(product);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        CustomerOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return mapToOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByIdAndUserId(Long orderId, Long userId) {
        CustomerOrder order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return mapToOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }

        List<CustomerOrder> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return orders.stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        List<CustomerOrder> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        return orders.stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String statusStr) {
        CustomerOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        try {
            OrderStatus newStatus = OrderStatus.valueOf(statusStr.toUpperCase());
            order.setStatus(newStatus);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Trạng thái đơn hàng không hợp lệ: " + statusStr);
        }

        CustomerOrder updatedOrder = orderRepository.save(order);
        return mapToOrderResponse(updatedOrder);
    }

    @Override
    public OrderResponse mapToOrderResponse(CustomerOrder order) {
        List<OrderItemResponse> itemResponses = new ArrayList<>();
        if (order.getItems() != null) {
            itemResponses = order.getItems().stream()
                    .map(item -> OrderItemResponse.builder()
                            .id(item.getId())
                            .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                            .productName(item.getProductName())
                            .quantity(item.getQuantity())
                            .unitPrice(item.getUnitPrice())
                            .subtotal(item.getSubtotal())
                            .build())
                    .collect(Collectors.toList());
        }

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .recipientName(order.getRecipientName())
                .recipientPhone(order.getRecipientPhone())
                .deliveryAddress(order.getDeliveryAddress())
                .note(order.getNote())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(itemResponses)
                .build();
    }
}
