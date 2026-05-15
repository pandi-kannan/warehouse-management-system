# 🏭 Enterprise Warehouse Management System (WMS)

> A robust, cloud-based Warehouse Management System built with Java Spring Boot and React.js —
> developed as part of the **Infotact Technical Internship Program**, Bengaluru, Karnataka.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Core Features](#core-features)
- [Four-Week Development Roadmap](#four-week-development-roadmap)
- [API Endpoints](#api-endpoints)
- [Security](#security)
- [Unit Testing](#unit-testing)
- [Setup and Installation](#setup-and-installation)

---

## Project Overview

With the exponential boom in e-commerce and rapid delivery expectations, traditional warehouse
operations relying on manual spreadsheets face severe operational bottlenecks. This WMS platform
automates core warehouse operations including:

- Real-time inventory tracking across multiple warehouses
- Optimized receiving and putaway logic into storage bins
- Efficient order picking and fulfillment workflows
- Barcode and QR code generation for automated data capture
- Role-based access for Warehouse Managers and Floor Operators

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Backend Framework | Java 21, Spring Boot 4.x | REST API, business logic, transaction management |
| Data Access Layer | Spring Data JPA / Hibernate | ORM, parameterized queries, SQL injection prevention |
| Primary Database | PostgreSQL 15 | ACID-compliant transactions, foreign key constraints |
| Security | Spring Security + JWT | Role-based authentication (ADMIN / OPERATOR) |
| Frontend | React.js + Axios | Dynamic UI consuming Spring Boot REST APIs |
| Barcode Library | ZXing (Zebra Crossing) | QR code and barcode generation for product SKUs |
| Testing | JUnit 5 + Mockito | Unit testing for core inventory services |
| Documentation | SpringDoc OpenAPI (Swagger) | Interactive API documentation |
| Build Tool | Maven | Dependency management and project build |

---

## Core Features

### 🏗️ Hierarchical Inventory Catalog
- Multi-warehouse support with Zones, Aisles, and specific Storage Bins
- Complex JPA relationships: `@OneToMany` and `@ManyToOne` across all entities
- Real-time inventory levels per product per bin per warehouse

### 📦 Receiving and Putaway Engine
- `@Transactional` stock receiving — stock count increase and bin mapping as a single atomic operation
- Putaway algorithm assigns incoming items to optimal storage bins
- Multi-bin stock management — dispatches stock across multiple bins automatically

### 🛒 Order Fulfillment Workflow
- Dynamic order state machine: `PENDING → PICKING → PACKED → SHIPPED`
- Stock automatically decremented when order moves to `PACKED` state
- `InsufficientStockException` thrown and handled when stock is unavailable

### 📊 Dashboard and Alerts
- Real-time stats: Total Products, Total Orders, Warehouses, Low Stock Alerts
- Low stock alerts triggered when inventory quantity reaches reorder level
- Full order history with status tracking

### 🔲 Barcode and QR Code Generation
- ZXing library integration for automatic barcode and QR code generation
- Unique barcode generated per product SKU
- Printable barcode images for warehouse floor scanning operations

### 🔐 Security
- JWT-based stateless authentication
- Role-based access control: `ADMIN` and `OPERATOR` roles
- Protected API endpoints — unauthorized access returns 401/403

---

## Four-Week Development Roadmap

### ✅ Week 1 — Spring Boot Scaffolding and Relational Schema Design

**Goal:** Initialize the project, design the database schema, and build foundational APIs.

**Tasks Completed:**
- Initialized GitHub repository with daily commit history
- Set up Spring Boot project via Spring Initializr with Web, JPA, and PostgreSQL dependencies
- Designed the Entity-Relationship (ER) model
- Created JPA Entities with full relationship mapping:

| Entity | Relationships |
|---|---|
| `Product` | `@OneToMany` → Inventory |
| `Warehouse` | `@OneToMany` → Bins |
| `Bin` (StorageBin) | `@ManyToOne` → Warehouse, `@OneToMany` → Inventory |
| `Inventory` (InventoryItem) | `@ManyToOne` → Product, `@ManyToOne` → Bin |
| `Order` | `@ManyToOne` → Product |

- Developed foundational CRUD REST controllers for all entities

---

### ✅ Week 2 — Transactional Inventory Logic and Putaway Algorithms

**Goal:** Implement business logic with data integrity guarantees.

**Tasks Completed:**
- Implemented `InventoryService` with full `@Transactional` support
- **Receive Stock:** When a shipment arrives, stock count increases AND items are mapped to a specific StorageBin as a single atomic operation — if either step fails, both are rolled back
- **Putaway Algorithm:** System assigns incoming stock to the correct bin; if no bin specified, defaults to first available bin
- **Dispatch Stock:** Multi-bin drain logic — automatically pulls stock from multiple bins when a single bin is insufficient
- `InsufficientStockException` thrown when total available stock across all bins is less than requested quantity

```java
// Core transactional receive operation
@Transactional
public Inventory receiveStock(Long productId, Integer quantity, Long binId) {
    // Atomic: stock increase + bin mapping in one transaction
}
```

---

### ✅ Week 3 — Barcode Integration and Order Processing Workflow

**Goal:** Introduce operational features for warehouse floor staff.

**Tasks Completed:**
- Integrated **ZXing (Zebra Crossing)** Java library for barcode and QR code generation
- Barcode auto-generated for every product SKU on creation
- Barcode images served as downloadable PNG via REST endpoint
- Built complete **Order Management Service**:
    - Create orders with product and quantity
    - Status transition endpoints: Pending → Picking → Packed → Shipped
    - Stock decremented automatically on `PACKED` state
    - `InsufficientStockException` explicitly caught and returned as structured error response

```
Order State Machine:
PENDING ──► PICKING ──► PACKED ──► SHIPPED
                           │
                    (stock decremented here)
```

---

### ✅ Week 4 — Security, Frontend Integration, and Testing

**Goal:** Secure the APIs, connect the React frontend, and write unit tests.

**Tasks Completed:**

**Security:**
- Implemented Spring Security with JWT (JSON Web Tokens)
- Stateless authentication — no server-side sessions
- Role-based access: `ADMIN` full access, `OPERATOR` scoped access
- All endpoints protected; public endpoints: `/api/auth/login`, `/api/auth/register`

**Frontend:**
- React.js frontend connected to all Spring Boot REST APIs via Axios
- Dashboard with live stats and low stock alerts
- Inventory management: view all stock, receive stock, dispatch stock
- Order management: create orders, update status, view history
- Role-aware UI: ADMIN sees all controls, OPERATOR sees task-focused view

**Unit Testing — 10 Tests, All Passing ✅**

| Test | Scenario |
|---|---|
| `receiveStock_shouldIncreaseQuantity` | Adds to existing inventory correctly |
| `receiveStock_shouldCreateNewInventory` | Creates new record when none exists |
| `receiveStock_shouldThrow_invalidQuantity` | Rejects zero and negative quantities |
| `receiveStock_shouldThrow_productNotFound` | Handles missing product |
| `receiveStock_shouldThrow_binNotFound` | Handles missing bin |
| `dispatchStock_shouldReduceQuantity` | Reduces stock correctly from single bin |
| `dispatchStock_shouldDrainAcrossMultipleBins` | Drains across bins when needed |
| `dispatchStock_shouldThrow_insufficient` | Throws InsufficientStockException |
| `dispatchStock_shouldThrow_noInventory` | Handles product with no inventory |
| `dispatchStock_shouldEmptyBin_exactMatch` | Bin reaches exactly zero |

```bash
# Run all tests
mvn test

# Result: Tests run: 10, Failures: 0, Errors: 0
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login and receive JWT token |

### Inventory
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/inventory` | ADMIN, OPERATOR | Get all inventory records |
| POST | `/api/inventory/receive` | ADMIN, OPERATOR | Receive stock into a bin |
| POST | `/api/inventory/dispatch` | ADMIN, OPERATOR | Dispatch stock for an order |
| GET | `/api/inventory/low-stock` | ADMIN | Get low stock items |

### Orders
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/orders` | ADMIN, OPERATOR | Get all orders |
| POST | `/api/orders` | ADMIN | Create new order |
| PUT | `/api/orders/{id}/status` | ADMIN, OPERATOR | Update order status |

### Products
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/products` | ADMIN, OPERATOR | Get all products |
| POST | `/api/products` | ADMIN | Create product |
| GET | `/api/products/{id}/barcode` | ADMIN, OPERATOR | Get product barcode image |

### Dashboard
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/dashboard/stats` | ADMIN | Get total products, orders, warehouses |
| GET | `/api/dashboard/alerts` | ADMIN | Get low stock alerts |

---

## Security

```
Request ──► JWT Filter ──► Validate Token ──► Check Role ──► Controller
                │
           Invalid Token
                │
            401 Unauthorized
```

**Roles:**
- `ADMIN` — Full access to all endpoints, user management, product creation
- `OPERATOR` — Receive stock, dispatch stock, update order status

---

## Unit Testing

Tests are written using **JUnit 5** and **Mockito** — no database required.
All repositories are mocked so tests run in milliseconds.

```java
@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock InventoryRepository inventoryRepository;
    @Mock ProductRepository productRepository;
    @Mock BinRepository binRepository;

    @InjectMocks InventoryService inventoryService;

    // 10 tests covering all business logic scenarios
}
```

---

## Setup and Installation

### Prerequisites
- Java 21+
- PostgreSQL 15+
- Node.js 18+ (for frontend)
- Maven 3.8+

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/warehouse-wms.git

# 2. Configure database in src/main/resources/application.properties
spring.datasource.url=jdbc:postgresql://localhost:5433/wms_db
spring.datasource.username=your_username
spring.datasource.password=your_password

# 3. Run the application
mvn spring-boot:run

# Backend runs on http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the React app
npm start

# Frontend runs on http://localhost:3000
```

---

## Project Structure

```
warehouse/
├── src/
│   ├── main/
│   │   ├── java/com/example/warehouse/
│   │   │   ├── controller/        # REST controllers
│   │   │   ├── service/           # Business logic
│   │   │   ├── repository/        # JPA repositories
│   │   │   ├── entity/            # JPA entities
│   │   │   ├── security/          # JWT + Spring Security
│   │   │   └── exception/         # Custom exceptions
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/com/example/warehouse/
│           └── service/
│               └── InventoryServiceTest.java  # 10 unit tests
├── frontend/                      # React.js application
├── pom.xml
└── README.md
```

---

*Developed for Infotact Technical Internship Program — Enterprise WMS Project*
*Bengaluru, Karnataka | Java Engineering Intern*
