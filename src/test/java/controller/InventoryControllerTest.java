package com.example.warehouse.controller;

import com.example.warehouse.dto.DispatchRequest;
import com.example.warehouse.dto.ReceiveRequest;
import com.example.warehouse.entity.Inventory;
import com.example.warehouse.service.InventoryService;
import com.example.warehouse.secuirity.JwtService;

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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(InventoryController.class)
class InventoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private InventoryService inventoryService;

    @MockitoBean
    private JwtService jwtService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void addInventory_shouldReturnInventory() throws Exception {

        Inventory inventory = new Inventory();

        when(inventoryService.addInventory(any(Inventory.class)))
                .thenReturn(inventory);

        mockMvc.perform(post("/api/inventory")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(inventory)))
                .andExpect(status().isOk());
    }

    @Test
    void getAllInventory_shouldReturnInventoryList() throws Exception {

        Inventory inventory1 = new Inventory();
        Inventory inventory2 = new Inventory();

        when(inventoryService.getAllInventory())
                .thenReturn(List.of(inventory1, inventory2));

        mockMvc.perform(get("/api/inventory"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void receiveStock_shouldReturnInventory() throws Exception {

        ReceiveRequest request = new ReceiveRequest();

        // Set values according to your ReceiveRequest class
        request.setProductId(1L);
        request.setQuantity(10);
        request.setBinId(1L);

        Inventory inventory = new Inventory();

        when(inventoryService.receiveStock(
                eq(1L),
                eq(10),
                eq(1L)
        )).thenReturn(inventory);

        mockMvc.perform(post("/api/inventory/receive")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void dispatchStock_shouldReturnInventory() throws Exception {

        DispatchRequest request = new DispatchRequest();

        // Set values according to your DispatchRequest class
        request.setProductId(1L);
        request.setQuantity(5);

        Inventory inventory = new Inventory();

        when(inventoryService.dispatchStock(
                eq(1L),
                eq(5)
        )).thenReturn(inventory);

        mockMvc.perform(post("/api/inventory/dispatch")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void getLowStockItems_shouldReturnInventoryList() throws Exception {

        Inventory inventory1 = new Inventory();
        Inventory inventory2 = new Inventory();

        when(inventoryService.getLowStockItems())
                .thenReturn(List.of(inventory1, inventory2));

        mockMvc.perform(get("/api/inventory/alerts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }
}