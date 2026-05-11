package com.example.warehouse.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inventory")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonBackReference(value = "product-inventory")
    private Product product;

    @ManyToOne
    @JoinColumn(name = "bin_id")
    @JsonBackReference
    private Bin bin;

    private Integer quantity;
}