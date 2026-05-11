package com.example.warehouse.controller;

import com.example.warehouse.entity.Bin;
import com.example.warehouse.service.BinService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bins")
@RequiredArgsConstructor
public class BinController {

    private final BinService binService;

    @PostMapping
    public ResponseEntity<Bin> addBin(@RequestBody Bin bin) {
        return ResponseEntity.ok(binService.addBin(bin));
    }

    @GetMapping
    public ResponseEntity<List<Bin>> getAllBins() {
        return ResponseEntity.ok(binService.getAllBins());
    }
}