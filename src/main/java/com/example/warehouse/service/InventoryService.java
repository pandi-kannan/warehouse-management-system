package com.example.warehouse.service;

import com.example.warehouse.exception.InsufficientStockException;
import com.example.warehouse.entity.*;
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

        return inventoryRepository.findAll()
                .stream()
                .filter(i -> i.getQuantity() < i.getReorderLevel())
                .toList();
    }

    @Transactional
    public Inventory receiveStock(Long productId, Integer quantity) {


        if (quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than zero");
        }


        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));


        Bin bin = binRepository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No bins available"));


        Optional<Inventory> existingInventory =
                inventoryRepository.findByProductAndBin(product, bin);


        if (existingInventory.isPresent()) {

            Inventory inventory = existingInventory.get();

            inventory.setQuantity(
                    inventory.getQuantity() + quantity
            );

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

        Inventory inventory = inventoryRepository.findAll()
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