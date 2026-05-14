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

    List<Inventory> findByProductAndBin(Product product, Bin bin);

    @Query("SELECT i FROM Inventory i WHERE i.quantity = 0")
    List<Inventory> findLowStockItems();

    List<Inventory> findByProductId(Long productId);
}