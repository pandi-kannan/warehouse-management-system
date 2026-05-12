package com.example.warehouse.controller;

import com.example.warehouse.dto.DispatchRequest;
import com.example.warehouse.dto.ReceiveRequest;
import com.example.warehouse.entity.Inventory;
import com.example.warehouse.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    public ResponseEntity<Inventory> addInventory(@RequestBody Inventory inventory) {
        return ResponseEntity.ok(inventoryService.addInventory(inventory));
    }

    @GetMapping
    public ResponseEntity<List<Inventory>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @PostMapping("/receive")
    public ResponseEntity<Inventory> receiveStock(@RequestBody ReceiveRequest request) {
        return ResponseEntity.ok(
                inventoryService.receiveStock(
                        request.getProductId(),
                        request.getQuantity()
                )
        );
    }

    @PostMapping("/dispatch")
    public ResponseEntity<Inventory> dispatchStock(@RequestBody DispatchRequest request) {
        return ResponseEntity.ok(
                inventoryService.dispatchStock(
                        request.getProductId(),
                        request.getQuantity()
                )
        );
    }
    @GetMapping("/alerts")
    public ResponseEntity<List<Inventory>> getLowStockItems() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }
}