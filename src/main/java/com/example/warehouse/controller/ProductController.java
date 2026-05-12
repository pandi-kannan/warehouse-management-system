package com.example.warehouse.controller;

import com.example.warehouse.entity.Product;
import com.example.warehouse.service.BarcodeService;
import com.example.warehouse.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final BarcodeService barcodeService;

    @PostMapping
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.addProduct(product));
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PutMapping("/{id}/barcode")
    public ResponseEntity<Product> generateBarcode(
            @PathVariable Long id,
            @RequestParam String barcode) {

        return ResponseEntity.ok(
                productService.generateBarcode(id, barcode)
        );
    }

    @GetMapping("/search")
    public List<Product> searchProductsByName(
            @RequestParam String name) {

        return productService.searchByName(name);
    }

    @GetMapping("/sku")
    public Product searchProductBySku(
            @RequestParam String sku) {

        return productService.searchBySku(sku);
    }

    @GetMapping("/barcode/{sku}")
    public ResponseEntity<byte[]> getBarcode(@PathVariable String sku) {

        byte[] image = barcodeService.generateBarcode(sku);

        return ResponseEntity.ok()
                .header("Content-Type", "image/png")
                .body(image);
    }
}