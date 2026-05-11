package com.example.warehouse.dto;

import lombok.Data;

@Data
public class DispatchRequest {

    private Long productId;
    private Integer quantity;
}