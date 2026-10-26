package service;

import com.example.warehouse.entity.OrderEntity;
import com.example.warehouse.entity.Product;
import com.example.warehouse.enums.OrderStatus;
import com.example.warehouse.repository.OrderRepository;
import com.example.warehouse.repository.ProductRepository;
import com.example.warehouse.service.InventoryService;
import com.example.warehouse.service.OrderService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private InventoryService inventoryService;

    @InjectMocks
    private OrderService orderService;


    @Test
    @DisplayName("updateOrderStatus: should allow PENDING to PICKING")
    void updateOrderStatus_shouldAllowPendingToPicking() {

        OrderEntity order = createOrder(OrderStatus.PENDING);

        when(orderRepository.findById(1L))
                .thenReturn(Optional.of(order));

        when(orderRepository.save(any(OrderEntity.class)))
                .thenAnswer(i -> i.getArgument(0));

        OrderEntity result =
                orderService.updateOrderStatus(
                        1L,
                        OrderStatus.PICKING
                );

        assertEquals(OrderStatus.PICKING, result.getStatus());

        verify(orderRepository, times(1))
                .save(order);

        verifyNoInteractions(inventoryService);
    }


    @Test
    @DisplayName("updateOrderStatus: should allow PICKING to PACKED and dispatch stock")
    void updateOrderStatus_shouldAllowPickingToPacked() {

        OrderEntity order = createOrder(OrderStatus.PICKING);

        when(orderRepository.findById(1L))
                .thenReturn(Optional.of(order));

        when(orderRepository.save(any(OrderEntity.class)))
                .thenAnswer(i -> i.getArgument(0));

        OrderEntity result =
                orderService.updateOrderStatus(
                        1L,
                        OrderStatus.PACKED
                );

        assertEquals(OrderStatus.PACKED, result.getStatus());

        verify(inventoryService, times(1))
                .dispatchStock(
                        order.getProduct().getId(),
                        order.getQuantity()
                );

        verify(orderRepository, times(1))
                .save(order);
    }


    @Test
    @DisplayName("updateOrderStatus: should allow PACKED to SHIPPED")
    void updateOrderStatus_shouldAllowPackedToShipped() {

        OrderEntity order = createOrder(OrderStatus.PACKED);

        when(orderRepository.findById(1L))
                .thenReturn(Optional.of(order));

        when(orderRepository.save(any(OrderEntity.class)))
                .thenAnswer(i -> i.getArgument(0));

        OrderEntity result =
                orderService.updateOrderStatus(
                        1L,
                        OrderStatus.SHIPPED
                );

        assertEquals(OrderStatus.SHIPPED, result.getStatus());

        verifyNoInteractions(inventoryService);
    }


    @Test
    @DisplayName("updateOrderStatus: should allow SHIPPED to DELIVERED")
    void updateOrderStatus_shouldAllowShippedToDelivered() {

        OrderEntity order = createOrder(OrderStatus.SHIPPED);

        when(orderRepository.findById(1L))
                .thenReturn(Optional.of(order));

        when(orderRepository.save(any(OrderEntity.class)))
                .thenAnswer(i -> i.getArgument(0));

        OrderEntity result =
                orderService.updateOrderStatus(
                        1L,
                        OrderStatus.DELIVERED
                );

        assertEquals(OrderStatus.DELIVERED, result.getStatus());

        verifyNoInteractions(inventoryService);
    }


    @Test
    @DisplayName("updateOrderStatus: should reject PENDING to PACKED")
    void updateOrderStatus_shouldRejectPendingToPacked() {

        OrderEntity order = createOrder(OrderStatus.PENDING);

        when(orderRepository.findById(1L))
                .thenReturn(Optional.of(order));

        assertThrows(
                IllegalStateException.class,
                () -> orderService.updateOrderStatus(
                        1L,
                        OrderStatus.PACKED
                )
        );

        verify(orderRepository, never())
                .save(any(OrderEntity.class));

        verifyNoInteractions(inventoryService);
    }


    @Test
    @DisplayName("updateOrderStatus: should reject PENDING to SHIPPED")
    void updateOrderStatus_shouldRejectPendingToShipped() {

        OrderEntity order = createOrder(OrderStatus.PENDING);

        when(orderRepository.findById(1L))
                .thenReturn(Optional.of(order));

        assertThrows(
                IllegalStateException.class,
                () -> orderService.updateOrderStatus(
                        1L,
                        OrderStatus.SHIPPED
                )
        );

        verify(orderRepository, never())
                .save(any(OrderEntity.class));

        verifyNoInteractions(inventoryService);
    }


    @Test
    @DisplayName("updateOrderStatus: should reject SHIPPED to PACKED")
    void updateOrderStatus_shouldRejectShippedToPacked() {

        OrderEntity order = createOrder(OrderStatus.SHIPPED);

        when(orderRepository.findById(1L))
                .thenReturn(Optional.of(order));

        assertThrows(
                IllegalStateException.class,
                () -> orderService.updateOrderStatus(
                        1L,
                        OrderStatus.PACKED
                )
        );

        verify(orderRepository, never())
                .save(any(OrderEntity.class));

        verifyNoInteractions(inventoryService);
    }

    @Test
    @DisplayName("updateOrderStatus: should reject same status")
    void updateOrderStatus_shouldRejectSameStatus() {

        OrderEntity order = createOrder(OrderStatus.PENDING);

        when(orderRepository.findById(1L))
                .thenReturn(Optional.of(order));

        assertThrows(
                IllegalStateException.class,
                () -> orderService.updateOrderStatus(
                        1L,
                        OrderStatus.PENDING
                )
        );

        verify(orderRepository, never())
                .save(any(OrderEntity.class));

        verifyNoInteractions(inventoryService);
    }


    @Test
    @DisplayName("updateOrderStatus: should throw when order does not exist")
    void updateOrderStatus_shouldThrowWhenOrderNotFound() {

        when(orderRepository.findById(99L))
                .thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> orderService.updateOrderStatus(
                                99L,
                                OrderStatus.PICKING
                        )
                );

        assertEquals("Order not found", exception.getMessage());

        verifyNoInteractions(inventoryService);
    }


    private OrderEntity createOrder(OrderStatus status) {

        Product product = new Product();
        product.setId(10L);

        OrderEntity order = new OrderEntity();

        order.setId(1L);
        order.setProduct(product);
        order.setQuantity(5);
        order.setStatus(status);

        return order;
    }
}