# BookNest: Microservices-Based E-Bookshop Platform

[![GitHub Repo](https://img.shields.io/badge/GitHub-anjanadulan%2FBookNest-blue?style=flat-square&logo=github)](https://github.com/anjanadulan/BookNest)

BookNest is a modern, distributed e-commerce application designed around a **3-Tier, Microservices Architecture**. The system splits core business domains into autonomous services, enforcing strict data isolation with a dedicated MySQL database for each service layer.

---

## 🏗️ System Architecture & Port Allocation

The application is decomposed into five independent microservices communicating synchronously over REST HTTP endpoints:

* **`book-service`** (Port `8081`): Handles catalog management, book categorization, pricing structures, and inventory.
* **`cart-service`** (Port `8082`): Manages temporary transactional staging for customer shopping sessions prior to checking out.
* **`order-service`** (Port `8083`): Orchestrates order placement, processing, and bridges data verification across services.
* **`payment-service`** (Port `8084`): Mock transactional ledger verifying credit card payment validations.
* **`user-service`** (Port `8085`): Manages customer/admin user profiles, registration, credentials, and roles (`CUSTOMER`, `ADMIN`).

### 📐 Architectural Highlights
* **Database-per-Service Pattern:** No service is allowed direct access to another service's database schema. Inter-service data validation is entirely handled via clean REST interfaces.
* **Service Decoupling:** Every microservice is compiled, managed, built, and run as an entirely independent Maven project, ensuring clean separation of concerns.
* **Data Integrity & Relational Mapping:** Leverages JPA/Hibernate relationships (e.g., `@OneToMany` and `@ManyToOne` bindings between `Order` and `OrderItem`) for structured relational mapping.

---

## 📂 Project Structure

```text
BookNest/
├── book-service/        # Port 8081 (Catalog & Category Management)
├── cart-service/        # Port 8082 (Session Cart items staging)
├── order-service/       # Port 8083 (Order & Invoice Management)
├── payment-service/     # Port 8084 (Transaction & Payment Mock)
├── user-service/        # Port 8085 (User profiles & Roles)
├── db_setup.sql         # Consolidated DB Schema & Seeding Script
└── README.md            # Project Documentation
```

---

## 🛠️ Technology Stack

* **Backend:** Java 17, Spring Boot v4.1.0 (Spring Web, Spring Data JPA)
* **Database:** MySQL Server 8+ (Isolated database schemas per microservice)
* **Data Handler:** Hibernate / Object-Relational Mapping (ORM)
* **Dependency Management:** Apache Maven (Multi-Module Layout)
* **API Testing:** Postman API client

---

## ⚙️ Configuration & Local Setup

### 1. Database Initialization
Ensure your MySQL instance is running. Execute the consolidated initialization script found at the root of the project to bootstrap all databases, tables, and seeding data:
```bash
mysql -u root -p < db_setup.sql
```
*Alternatively, copy and run the contents of [db_setup.sql](db_setup.sql) in your preferred SQL client (MySQL Workbench, DBeaver, etc.).*

This creates and seeds five databases:
* `booknest_book`
* `booknest_user`
* `booknest_cart`
* `booknest_order`
* `booknest_payment`

### 2. Application Properties Configuration
Ensure each microservice's `src/main/resources/application.properties` targets its respective port and database URL.
Example configuration for **`book-service`**:
```properties
server.port=8081
spring.application.name=book-service
spring.datasource.url=jdbc:mysql://localhost:3306/booknest_book
spring.datasource.username=root
spring.datasource.password=your_mysql_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### 3. Build & Run the Services
To build and package all services, run the following command in each microservice folder:
```bash
./mvnw clean package -DskipTests
```
To run the Spring Boot applications:
```bash
./mvnw spring-boot:run
```

---

## 📡 REST API Endpoints Summary

### 📚 Book Service (Port `8081`)
| HTTP Method | Endpoint | Request Body | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/books` | *None* | Retrieve all available books |
| **GET** | `/api/books/{id}` | *None* | Retrieve a specific book by ID |
| **GET** | `/api/books?name={name}` | *None* | Search for books by title |
| **POST** | `/api/books` | `Book` JSON | Create a new book entry |
| **PUT** | `/api/books` | `Book` JSON | Update an existing book |
| **DELETE** | `/api/books/{id}` | *None* | Delete a book by ID |

### 🛒 Cart Service (Port `8082`)
| HTTP Method | Endpoint | Request Body | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/cart` | *None* | Retrieve all cart items |
| **GET** | `/api/cart/{id}` | *None* | Retrieve a specific cart item by ID |
| **GET** | `/api/cart?userId={userId}` | *None* | Retrieve cart items for a specific user |
| **POST** | `/api/cart` | `CartItem` JSON | Add a new item to the cart |
| **PUT** | `/api/cart` | `CartItem` JSON | Update a cart item (e.g. quantity) |
| **DELETE** | `/api/cart/{id}` | *None* | Remove a cart item by ID |

### 📦 Order Service (Port `8083`)
| HTTP Method | Endpoint | Request Body | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/orders` | *None* | Retrieve all orders |
| **GET** | `/api/orders/{id}` | *None* | Retrieve a specific order by ID (includes order items) |
| **GET** | `/api/orders?userId={userId}` | *None* | Retrieve all orders placed by a specific user |
| **POST** | `/api/orders` | `Order` JSON | Place a new order (with nested `orderItems`) |
| **PUT** | `/api/orders` | `Order` JSON | Update an existing order |
| **DELETE** | `/api/orders/{id}` | *None* | Delete an order by ID (cascades to items) |

### 💳 Payment Service (Port `8084`)
| HTTP Method | Endpoint | Request Body | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/payments` | *None* | Retrieve all payment records |
| **GET** | `/api/payments/{id}` | *None* | Retrieve a specific payment by ID |
| **GET** | `/api/payments?userId={userId}` | *None* | Retrieve all payments associated with a specific user |
| **POST** | `/api/payments` | `Payment` JSON | Record a new payment entry |
| **PUT** | `/api/payments` | `Payment` JSON | Update an existing payment record |
| **DELETE** | `/api/payments/{id}` | *None* | Delete a payment record by ID |

### 👥 User Service (Port `8085`)
| HTTP Method | Endpoint | Request Body | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/users` | *None* | Retrieve all user profiles |
| **GET** | `/api/users/{id}` | *None* | Retrieve a specific user by ID |
| **GET** | `/api/users?name={name}` | *None* | Search for users by name |
| **POST** | `/api/users` | `User` JSON | Create a new user profile |
| **PUT** | `/api/users` | `User` JSON | Update an existing user |
| **DELETE** | `/api/users/{id}` | *None* | Delete a user by ID |

---

## 🎓 Viva Preparation & Architectural Focus
* **Academic Rigor:** Designed around core enterprise software engineering principles such as the **Database-per-Service** and **Single Responsibility Principle (SRP)**. Shows clear understanding of distributed architecture.
* **Synchronous REST Communication:** Demonstrates how clean endpoints validate cross-service constraints (e.g., verifying if the Book or User exists before processing an order).
* **Data Separation:** Strict database mapping proves there is no shared-memory or schema leakage across services, keeping the architecture loosely coupled.
