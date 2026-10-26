package com.example.warehouse.controller;

import com.example.warehouse.entity.Warehouse;
import com.example.warehouse.service.WarehouseService;
import com.example.warehouse.secuirity.JwtService;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(WarehouseController.class)
class WarehouseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private WarehouseService warehouseService;

    @MockitoBean
    private JwtService jwtService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void addWarehouse_shouldReturnWarehouse() throws Exception {

        Warehouse warehouse = new Warehouse();

        when(warehouseService.addWarehouse(any(Warehouse.class)))
                .thenReturn(warehouse);

        mockMvc.perform(post("/api/warehouses")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(warehouse)))
                .andExpect(status().isOk());
    }

    @Test
    void getAllWarehouses_shouldReturnWarehouses() throws Exception {

        Warehouse warehouse1 = new Warehouse();
        Warehouse warehouse2 = new Warehouse();

        when(warehouseService.getAllWarehouses())
                .thenReturn(List.of(warehouse1, warehouse2));

        mockMvc.perform(get("/api/warehouses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }
}