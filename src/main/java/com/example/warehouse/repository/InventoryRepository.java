package com.example.warehouse.repository;

import com.example.warehouse.entity.Bin;
import com.example.warehouse.entity.Inventory;
import com.example.warehouse.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductAndBin(Product product, Bin bin);
}