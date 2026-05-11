package com.example.warehouse.dto;

import lombok.Data;

@Data
public class OrderRequest {

    private String orderNumber;
    private String customerName;
    private Long productId;
    private Integer quantity;
}