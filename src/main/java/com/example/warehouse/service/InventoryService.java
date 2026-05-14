package com.example.warehouse.service;

import com.example.warehouse.entity.*;
import com.example.warehouse.exception.InsufficientStockException;
import com.example.warehouse.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final BinRepository binRepository;

    public Inventory addInventory(Inventory inventory) {
        return inventoryRepository.save(inventory);
    }

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public List<Inventory> getLowStockItems() {
        return inventoryRepository.findLowStockItems();
    }

    @Transactional
    public Inventory receiveStock(Long productId, Integer quantity, Long binId) {

        if (quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than zero");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Bin bin;
        if (binId != null) {
            bin = binRepository.findById(binId)
                    .orElseThrow(() -> new RuntimeException("Bin not found"));
        } else {
            bin = binRepository.findAll()
                    .stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No bins available"));
        }

        List<Inventory> existingInventory =
                inventoryRepository.findByProductAndBin(product, bin);

        if (!existingInventory.isEmpty()) {                      // ← fix 1: was isEmpty()
            Inventory inventory = existingInventory.get(0);     // ← fix 2: was get()
            inventory.setQuantity(inventory.getQuantity() + quantity);
            return inventoryRepository.save(inventory);
        }

        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setBin(bin);
        inventory.setQuantity(quantity);

        return inventoryRepository.save(inventory);
    }

    @Transactional
    public Inventory dispatchStock(Long productId, Integer quantity) {

        List<Inventory> inventoryList = inventoryRepository.findByProductId(productId);

        if (inventoryList.isEmpty()) {
            throw new RuntimeException("No inventory found for this product");
        }

        int totalAvailable = inventoryList.stream()
                .mapToInt(Inventory::getQuantity)
                .sum();

        if (totalAvailable < quantity) {
            throw new InsufficientStockException(
                    "Insufficient stock! Available: " + totalAvailable +
                            ", Required: " + quantity
            );
        }

        int remaining = quantity;

        for (Inventory inventory : inventoryList) {
            if (remaining <= 0) break;

            if (inventory.getQuantity() >= remaining) {
                inventory.setQuantity(inventory.getQuantity() - remaining);
                remaining = 0;
            } else {
                remaining -= inventory.getQuantity();
                inventory.setQuantity(0);
            }
            inventoryRepository.save(inventory);
        }

        return inventoryList.get(0);
    }
}