package com.example.warehouse.controller;

import com.example.warehouse.entity.Bin;
import com.example.warehouse.service.BinService;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BinController.class)
class BinControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BinService binService;

    @MockitoBean
    private JwtService jwtService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void addBin_shouldReturnBin() throws Exception {

        Bin bin = new Bin();

        when(binService.addBin(any(Bin.class)))
                .thenReturn(bin);

        mockMvc.perform(post("/api/bins")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(bin)))
                .andExpect(status().isOk());
    }

    @Test
    void getAllBins_shouldReturnBins() throws Exception {

        Bin bin1 = new Bin();
        Bin bin2 = new Bin();

        when(binService.getAllBins())
                .thenReturn(List.of(bin1, bin2));

        mockMvc.perform(get("/api/bins"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }
}