package com.example.warehouse.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "bins")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String binCode;

    @ManyToOne
    @JoinColumn(name = "warehouse_id")
    @JsonBackReference(value = "warehouse-inventory")

    private Warehouse warehouse;

    @OneToMany(mappedBy = "bin")
    @JsonManagedReference
    private List<Inventory> inventories;
}