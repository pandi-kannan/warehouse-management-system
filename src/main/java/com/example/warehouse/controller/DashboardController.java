package com.example.warehouse.controller;

import com.example.warehouse.repository.OrderRepository;
import com.example.warehouse.repository.ProductRepository;
import com.example.warehouse.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final OrderRepository orderRepository;

    @GetMapping("/stats")
    public Map<String, Long> getStats() {

        Map<String, Long> stats = new HashMap<>();

        stats.put("totalProducts",
                productRepository.count());

        stats.put("totalWarehouses",
                warehouseRepository.count());

        stats.put("totalOrders",
                orderRepository.count());

        return stats;
    }
}