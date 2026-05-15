package service;

import com.example.warehouse.entity.Bin;
import com.example.warehouse.entity.Inventory;
import com.example.warehouse.entity.Product;
import com.example.warehouse.exception.InsufficientStockException;
import com.example.warehouse.repository.BinRepository;
import com.example.warehouse.repository.InventoryRepository;
import com.example.warehouse.repository.ProductRepository;
import com.example.warehouse.service.InventoryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    // --- Mocks (fake versions, no real DB) ---
    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private BinRepository binRepository;

    // --- Real service with mocks injected into it ---
    @InjectMocks
    private InventoryService inventoryService;


    // =====================================================
    // receiveStock() tests
    // =====================================================

    @Test
    @DisplayName("receiveStock: should increase quantity when inventory already exists in that bin")
    void receiveStock_shouldIncreaseQuantity_whenInventoryExists() {

        // ARRANGE
        Product product = new Product();
        product.setId(1L);

        Bin bin = new Bin();
        bin.setId(1L);

        Inventory existing = new Inventory();
        existing.setId(1L);
        existing.setProduct(product);
        existing.setBin(bin);
        existing.setQuantity(10);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(binRepository.findById(1L)).thenReturn(Optional.of(bin));
        when(inventoryRepository.findByProductAndBin(product, bin)).thenReturn(List.of(existing));
        when(inventoryRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        // ACT
        Inventory result = inventoryService.receiveStock(1L, 5, 1L);

        // ASSERT
        assertEquals(15, result.getQuantity()); // 10 + 5
        verify(inventoryRepository, times(1)).save(existing);
    }

    @Test
    @DisplayName("receiveStock: should create new inventory when none exists in that bin")
    void receiveStock_shouldCreateNewInventory_whenNoneExists() {

        // ARRANGE
        Product product = new Product();
        product.setId(1L);

        Bin bin = new Bin();
        bin.setId(1L);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(binRepository.findById(1L)).thenReturn(Optional.of(bin));
        when(inventoryRepository.findByProductAndBin(product, bin)).thenReturn(Collections.emptyList());
        when(inventoryRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        // ACT
        Inventory result = inventoryService.receiveStock(1L, 20, 1L);

        // ASSERT
        assertEquals(20, result.getQuantity());
        assertEquals(product, result.getProduct());
        assertEquals(bin, result.getBin());
    }

    @Test
    @DisplayName("receiveStock: should throw when quantity is zero or negative")
    void receiveStock_shouldThrow_whenQuantityIsInvalid() {

        // ACT & ASSERT
        assertThrows(RuntimeException.class,
                () -> inventoryService.receiveStock(1L, 0, 1L));

        assertThrows(RuntimeException.class,
                () -> inventoryService.receiveStock(1L, -5, 1L));
    }

    @Test
    @DisplayName("receiveStock: should throw when product not found")
    void receiveStock_shouldThrow_whenProductNotFound() {

        // ARRANGE
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        // ACT & ASSERT
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> inventoryService.receiveStock(99L, 10, 1L));

        assertEquals("Product not found", ex.getMessage());
    }

    @Test
    @DisplayName("receiveStock: should throw when bin not found")
    void receiveStock_shouldThrow_whenBinNotFound() {

        // ARRANGE
        Product product = new Product();
        product.setId(1L);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(binRepository.findById(99L)).thenReturn(Optional.empty());

        // ACT & ASSERT
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> inventoryService.receiveStock(1L, 10, 99L));

        assertEquals("Bin not found", ex.getMessage());
    }


    // =====================================================
    // dispatchStock() tests
    // =====================================================

    @Test
    @DisplayName("dispatchStock: should reduce quantity from a single bin correctly")
    void dispatchStock_shouldReduceQuantity_whenStockIsSufficient() {

        // ARRANGE
        Inventory inventory = new Inventory();
        inventory.setId(1L);
        inventory.setQuantity(50);

        when(inventoryRepository.findByProductId(1L)).thenReturn(List.of(inventory));
        when(inventoryRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        // ACT
        inventoryService.dispatchStock(1L, 20);

        // ASSERT
        assertEquals(30, inventory.getQuantity()); // 50 - 20
    }

    @Test
    @DisplayName("dispatchStock: should drain across multiple bins when one bin is not enough")
    void dispatchStock_shouldDrainAcrossMultipleBins() {

        // ARRANGE
        Inventory bin1 = new Inventory(); bin1.setId(1L); bin1.setQuantity(10);
        Inventory bin2 = new Inventory(); bin2.setId(2L); bin2.setQuantity(20);

        when(inventoryRepository.findByProductId(1L)).thenReturn(List.of(bin1, bin2));
        when(inventoryRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        // ACT
        inventoryService.dispatchStock(1L, 25);

        // ASSERT
        assertEquals(0, bin1.getQuantity());  // fully drained
        assertEquals(5, bin2.getQuantity());  // 20 - 15 remaining
    }

    @Test
    @DisplayName("dispatchStock: should throw InsufficientStockException when not enough stock")
    void dispatchStock_shouldThrow_whenStockInsufficient() {

        // ARRANGE
        Inventory inventory = new Inventory();
        inventory.setId(1L);
        inventory.setQuantity(5);

        when(inventoryRepository.findByProductId(1L)).thenReturn(List.of(inventory));

        // ACT & ASSERT
        InsufficientStockException ex = assertThrows(InsufficientStockException.class,
                () -> inventoryService.dispatchStock(1L, 10));

        assertTrue(ex.getMessage().contains("Insufficient stock"));
        assertTrue(ex.getMessage().contains("Available: 5"));
    }

    @Test
    @DisplayName("dispatchStock: should throw RuntimeException when no inventory found for product")
    void dispatchStock_shouldThrow_whenNoInventoryFound() {

        // ARRANGE
        when(inventoryRepository.findByProductId(99L)).thenReturn(Collections.emptyList());

        // ACT & ASSERT
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> inventoryService.dispatchStock(99L, 10));

        assertEquals("No inventory found for this product", ex.getMessage());
    }

    @Test
    @DisplayName("dispatchStock: should exactly empty a bin when quantity matches exactly")
    void dispatchStock_shouldEmptyBin_whenQuantityMatchesExactly() {

        // ARRANGE
        Inventory inventory = new Inventory();
        inventory.setId(1L);
        inventory.setQuantity(15);

        when(inventoryRepository.findByProductId(1L)).thenReturn(List.of(inventory));
        when(inventoryRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        // ACT
        inventoryService.dispatchStock(1L, 15);

        // ASSERT
        assertEquals(0, inventory.getQuantity());
    }
}