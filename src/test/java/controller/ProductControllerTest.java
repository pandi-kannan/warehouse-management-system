package com.example.warehouse.controller;

import com.example.warehouse.entity.Product;
import com.example.warehouse.service.BarcodeService;
import com.example.warehouse.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import com.example.warehouse.secuirity.JwtService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private ProductService productService;

    @MockitoBean
    private BarcodeService barcodeService;

    @MockitoBean
    private JwtService jwtService;


    @Test
    void addProduct_shouldReturnProduct() throws Exception {

        Product product = new Product();
        product.setName("Laptop");
        product.setSku("LAP001");

        when(productService.addProduct(any(Product.class)))
                .thenReturn(product);

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(product)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Laptop"))
                .andExpect(jsonPath("$.sku").value("LAP001"));
    }
    @Test
    void getAllProducts_shouldReturnProducts() throws Exception {

        Product product1 = new Product();
        product1.setName("Laptop");
        product1.setSku("LAP001");

        Product product2 = new Product();
        product2.setName("Mouse");
        product2.setSku("MOU001");

        when(productService.getAllProducts())
                .thenReturn(List.of(product1, product2));

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Laptop"))
                .andExpect(jsonPath("$[1].name").value("Mouse"));
    }

    @Test
    void getProductById_shouldReturnProduct() throws Exception {

        Product product = new Product();
        product.setName("Laptop");
        product.setSku("LAP001");

        when(productService.getProductById(1L))
                .thenReturn(product);

        mockMvc.perform(get("/api/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Laptop"))
                .andExpect(jsonPath("$.sku").value("LAP001"));
    }

    @Test
    void generateBarcode_shouldReturnProduct() throws Exception {

        Product product = new Product();
        product.setName("Laptop");
        product.setSku("LAP001");

        when(productService.generateBarcode(1L, "123456789"))
                .thenReturn(product);

        mockMvc.perform(put("/api/products/1/barcode")
                        .param("barcode", "123456789"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Laptop"))
                .andExpect(jsonPath("$.sku").value("LAP001"));
    }

    @Test
    void searchProductsByName_shouldReturnMatchingProducts() throws Exception {

        Product product = new Product();
        product.setName("Laptop");
        product.setSku("LAP001");

        when(productService.searchByName("Laptop"))
                .thenReturn(List.of(product));

        mockMvc.perform(get("/api/products/search")
                        .param("name", "Laptop"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Laptop"));
    }

    void searchProductBySku_shouldReturnProduct() throws Exception {

        Product product = new Product();
        product.setName("Laptop");
        product.setSku("LAP001");

        when(productService.searchBySku("LAP001"))
                .thenReturn(product);

        mockMvc.perform(get("/api/products/sku")
                        .param("sku", "LAP001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Laptop"))
                .andExpect(jsonPath("$.sku").value("LAP001"));
    }

    @Test
    void getBarcode_shouldReturnPngImage() throws Exception {

        byte[] barcodeImage = new byte[]{1, 2, 3, 4};

        when(barcodeService.generateBarcode("LAP001"))
                .thenReturn(barcodeImage);

        mockMvc.perform(get("/api/products/barcode/LAP001"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "image/png"))
                .andExpect(content().bytes(barcodeImage));
    }
}