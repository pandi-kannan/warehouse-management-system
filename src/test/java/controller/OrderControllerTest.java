package com.example.warehouse.controller;

import com.example.warehouse.dto.OrderRequest;
import com.example.warehouse.entity.OrderEntity;
import com.example.warehouse.enums.OrderStatus;
import com.example.warehouse.secuirity.JwtService;
import com.example.warehouse.service.OrderService;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OrderService orderService;

    @MockitoBean
    private JwtService jwtService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void createOrder_shouldReturnOrder() throws Exception {

        OrderRequest request = new OrderRequest();

        OrderEntity order = new OrderEntity();

        when(orderService.createOrder(any(OrderRequest.class)))
                .thenReturn(order);

        mockMvc.perform(post("/api/orders")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void getAllOrders_shouldReturnOrders() throws Exception {

        OrderEntity order1 = new OrderEntity();
        OrderEntity order2 = new OrderEntity();

        when(orderService.getAllOrders())
                .thenReturn(List.of(order1, order2));

        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void updateStatus_shouldReturnUpdatedOrder() throws Exception {

        OrderEntity order = new OrderEntity();

        when(orderService.updateOrderStatus(
                eq(1L),
                eq(OrderStatus.SHIPPED)
        )).thenReturn(order);

        mockMvc.perform(put("/api/orders/1/status")
                        .param("status", "SHIPPED"))
                .andExpect(status().isOk());
    }
}