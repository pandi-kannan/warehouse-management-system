package com.example.warehouse.service;

import com.example.warehouse.dto.OrderRequest;
import com.example.warehouse.entity.OrderEntity;
import com.example.warehouse.entity.Product;
import com.example.warehouse.enums.OrderStatus;
import com.example.warehouse.repository.OrderRepository;
import com.example.warehouse.repository.ProductRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    public OrderEntity createOrder(OrderRequest request) {

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        OrderEntity order = new OrderEntity();

        order.setOrderNumber(request.getOrderNumber());
        order.setCustomerName(request.getCustomerName());
        order.setQuantity(request.getQuantity());
        order.setProduct(product);
        order.setStatus(OrderStatus.PENDING);

        return orderRepository.save(order);
    }

    public List<OrderEntity> getAllOrders() {
        return orderRepository.findAll();
    }

    public OrderEntity updateOrderStatus(
            Long orderId,
            OrderStatus newStatus) {

        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        OrderStatus currentStatus = order.getStatus();

        validateStatusTransition(currentStatus, newStatus);

        if (currentStatus == OrderStatus.PICKING
                && newStatus == OrderStatus.PACKED) {

            inventoryService.dispatchStock(
                    order.getProduct().getId(),
                    order.getQuantity()
            );
        }

        order.setStatus(newStatus);

        return orderRepository.save(order);
    }

    private void validateStatusTransition(
            OrderStatus currentStatus,
            OrderStatus newStatus) {

        if (currentStatus == newStatus) {
            throw new IllegalStateException(
                    "Order is already in " + currentStatus + " status"
            );
        }

        boolean validTransition =
                (currentStatus == OrderStatus.PENDING
                        && newStatus == OrderStatus.PICKING)

                        || (currentStatus == OrderStatus.PICKING
                        && newStatus == OrderStatus.PACKED)

                        || (currentStatus == OrderStatus.PACKED
                        && newStatus == OrderStatus.SHIPPED)

                        || (currentStatus == OrderStatus.SHIPPED
                        && newStatus == OrderStatus.DELIVERED);

        if (!validTransition) {
            throw new IllegalStateException(
                    "Invalid order status transition: "
                            + currentStatus + " -> " + newStatus
            );
        }
    }
}