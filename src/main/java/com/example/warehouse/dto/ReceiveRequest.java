package com.example.warehouse.dto;

import lombok.Data;

@Data
public class ReceiveRequest {
    private Long productId;
    private Integer quantity;
    private Long binId;
}