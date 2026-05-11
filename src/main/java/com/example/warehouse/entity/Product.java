package com.example.warehouse.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "product")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String sku;
    private String description;
    private Double price;
    private String barcode;


    @OneToMany(mappedBy = "product")
    @JsonManagedReference(value = "product-inventory")
    private List<Inventory> inventories;
}