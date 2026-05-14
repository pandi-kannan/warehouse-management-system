package com.example.warehouse.service;

import com.example.warehouse.entity.*;
import com.example.warehouse.exception.InsufficientStockException;
import com.example.warehouse.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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

        // Use selected bin if provided, otherwise fall back to first bin
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

        // Check if this product already exists in this specific bin
        Optional<Inventory> existingInventory =
                inventoryRepository.findByProductAndBin(product, bin);

        if (existingInventory.isPresent()) {
            Inventory inventory = existingInventory.get();
            inventory.setQuantity(inventory.getQuantity() + quantity);
            return inventoryRepository.save(inventory);
        }

        // Create new inventory record for this product in this bin
        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setBin(bin);
        inventory.setQuantity(quantity);

        return inventoryRepository.save(inventory);
    }

    @Transactional
    public Inventory dispatchStock(Long productId, Integer quantity) {

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .stream()
                .filter(inv -> inv.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("Inventory not found for product"));

        if (inventory.getQuantity() < quantity) {
            throw new InsufficientStockException("Insufficient stock available");
        }

        inventory.setQuantity(inventory.getQuantity() - quantity);

        return inventoryRepository.save(inventory);
    }
}