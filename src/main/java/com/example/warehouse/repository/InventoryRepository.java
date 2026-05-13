package com.example.warehouse.repository;

import com.example.warehouse.entity.Bin;
import com.example.warehouse.entity.Inventory;
import com.example.warehouse.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductAndBin(Product product, Bin bin);
    List<Inventory> findByQuantityLessThan(Integer reorderLevel);
    @Query("SELECT i FROM Inventory i WHERE i.quantity < i.reorderLevel")

    List<Inventory> findLowStockItems();

    Optional<Inventory> findByProductId(Long productId);
}