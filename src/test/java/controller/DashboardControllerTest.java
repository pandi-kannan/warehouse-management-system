package com.example.warehouse.controller;

import com.example.warehouse.entity.Inventory;
import com.example.warehouse.repository.InventoryRepository;
import com.example.warehouse.repository.OrderRepository;
import com.example.warehouse.repository.ProductRepository;
import com.example.warehouse.repository.WarehouseRepository;
import com.example.warehouse.secuirity.JwtService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DashboardController.class)
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductRepository productRepository;

    @MockitoBean
    private WarehouseRepository warehouseRepository;

    @MockitoBean
    private OrderRepository orderRepository;

    @MockitoBean
    private InventoryRepository inventoryRepository;

    @MockitoBean
    private JwtService jwtService;

    @Test
    void getStats_shouldReturnDashboardStats() throws Exception {

        when(productRepository.count()).thenReturn(10L);
        when(warehouseRepository.count()).thenReturn(3L);
        when(orderRepository.count()).thenReturn(20L);

        mockMvc.perform(get("/api/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProducts").value(10))
                .andExpect(jsonPath("$.totalWarehouses").value(3))
                .andExpect(jsonPath("$.totalOrders").value(20));
    }

    @Test
    void getLowStockAlerts_shouldReturnInventoryList() throws Exception {

        Inventory inventory1 = new Inventory();
        Inventory inventory2 = new Inventory();

        when(inventoryRepository.findLowStockItems())
                .thenReturn(List.of(inventory1, inventory2));

        mockMvc.perform(get("/api/dashboard/alerts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }
}