package com.example.warehouse.controller;

import com.example.warehouse.dto.OrderRequest;
import com.example.warehouse.entity.OrderEntity;
import com.example.warehouse.enums.OrderStatus;
import com.example.warehouse.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderEntity> createOrder(
            @RequestBody OrderRequest request) {

        return ResponseEntity.ok(
                orderService.createOrder(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<OrderEntity>> getAllOrders() {

        return ResponseEntity.ok(
                orderService.getAllOrders()
        );
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderEntity> updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {

        return ResponseEntity.ok(
                orderService.updateOrderStatus(id, status)
        );
    }
}