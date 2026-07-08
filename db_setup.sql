-- ======================================================
-- BookNest 5-Microservices Database Setup & Seeding Script
-- ======================================================

-- 1. USER SERVICE DATABASE
CREATE
DATABASE IF NOT EXISTS booknest_user;
USE
booknest_user;

CREATE TABLE IF NOT EXISTS users
(
    id
    INT
    AUTO_INCREMENT
    PRIMARY
    KEY,
    name
    VARCHAR
(
    255
) NOT NULL,
    email VARCHAR
(
    255
) NOT NULL UNIQUE,
    password VARCHAR
(
    255
) NOT NULL,
    role VARCHAR
(
    50
) NOT NULL
    );

INSERT INTO users (name, email, password, role)
VALUES ('System Administrator', 'admin@booknest.com', 'admin123', 'ADMIN'),
       ('John Doe', 'john@gmail.com', 'john123', 'CUSTOMER'),
       ('Jane Smith', 'jane@gmail.com', 'jane123', 'CUSTOMER') ON DUPLICATE KEY
UPDATE email=email;


-- 2. BOOK SERVICE DATABASE
CREATE
DATABASE IF NOT EXISTS booknest_book;
USE
booknest_book;

CREATE TABLE IF NOT EXISTS categories
(
    id
    INT
    AUTO_INCREMENT
    PRIMARY
    KEY,
    name
    VARCHAR
(
    255
) NOT NULL
    );

CREATE TABLE IF NOT EXISTS books
(
    id
    INT
    AUTO_INCREMENT
    PRIMARY
    KEY,
    title
    VARCHAR
(
    255
) NOT NULL,
    author VARCHAR
(
    255
) NOT NULL,
    isbn VARCHAR(50),
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    cover_url VARCHAR(500) DEFAULT NULL,
    description VARCHAR(1000) DEFAULT NULL,
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
    );

INSERT INTO categories (id, name)
VALUES (1, 'Fiction'),
       (2, 'Science'),
       (3, 'History'),
       (4, 'Biography') ON DUPLICATE KEY
UPDATE name= name;

INSERT INTO books (title, author, isbn, price, stock, cover_url, description, category_id)
VALUES ('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 15.99, 100, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80', 'The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan, capturing the essence of the roaring twenties.', 1),
       ('To Kill a Mockingbird', 'Harper Lee', '9780446310789', 12.50, 80, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80', 'Compassionate, dramatic, and deeply moving, To Kill A Mockingbird takes readers to the roots of human behavior - to innocence and experience, kindness and cruelty, love and hatred.', 1),
       ('A Brief History of Time', 'Stephen Hawking', '9780553380163', 18.99, 50, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80', 'A landmark volume in science writing by one of the great minds of our time, Stephen Hawking explores the mysteries of space, time, black holes, and the origin of the universe.', 2),
       ('Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', '9780062316097', 22.00, 60, 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=400&q=80', 'Yuval Noah Harari spans the whole of human history, from the very first humans to walk the earth to the radical and sometimes devious breakthroughs of our cognitive, agricultural, and scientific revolutions.', 3),
       ('Steve Jobs', 'Walter Isaacson', '9781451648539', 24.99, 40, 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80', 'Based on more than forty interviews with Jobs conducted over two years, Walter Isaacson chronicles the roller-coaster life and searingly intense personality of a creative entrepreneur whose passion for perfection and ferocious drive revolutionized six industries.', 4) ON DUPLICATE KEY
UPDATE isbn=isbn;


-- 3. CART SERVICE DATABASE
CREATE
DATABASE IF NOT EXISTS booknest_cart;
USE
booknest_cart;

CREATE TABLE IF NOT EXISTS cart_items
(
    id
    INT
    AUTO_INCREMENT
    PRIMARY
    KEY,
    user_id
    INT
    NOT
    NULL,
    book_id
    INT
    NOT
    NULL,
    quantity
    INT
    NOT
    NULL
);

INSERT INTO cart_items (user_id, book_id, quantity)
VALUES (2, 1, 2),
       (2, 3, 1) ON DUPLICATE KEY
UPDATE quantity=quantity;


-- 4. ORDER SERVICE DATABASE
CREATE
DATABASE IF NOT EXISTS booknest_order;
USE
booknest_order;

CREATE TABLE IF NOT EXISTS orders
(
    id
    INT
    AUTO_INCREMENT
    PRIMARY
    KEY,
    user_id
    INT
    NOT
    NULL,
    total_amount
    DECIMAL
(
    10,
    2
) NOT NULL,
    status VARCHAR
(
    50
) NOT NULL,
    order_date DATETIME NOT NULL
    );

CREATE TABLE IF NOT EXISTS order_items
(
    id
    INT
    AUTO_INCREMENT
    PRIMARY
    KEY,
    order_id
    INT
    NOT
    NULL,
    book_id
    INT
    NOT
    NULL,
    quantity
    INT
    NOT
    NULL,
    price
    DECIMAL
(
    10,
    2
) NOT NULL,
    FOREIGN KEY
(
    order_id
) REFERENCES orders
(
    id
) ON DELETE CASCADE
    );

INSERT INTO orders (id, user_id, total_amount, status, order_date)
VALUES (1, 3, 43.99, 'COMPLETED', NOW()) ON DUPLICATE KEY
UPDATE status=status;

INSERT INTO order_items (order_id, book_id, quantity, price)
VALUES (1, 2, 1, 12.50),
       (1, 5, 1, 24.99) ON DUPLICATE KEY
UPDATE price=price;


-- 5. PAYMENT SERVICE DATABASE
CREATE
DATABASE IF NOT EXISTS booknest_payment;
USE
booknest_payment;

CREATE TABLE IF NOT EXISTS payments
(
    id
    INT
    AUTO_INCREMENT
    PRIMARY
    KEY,
    order_id
    INT
    NOT
    NULL,
    user_id
    INT
    NOT
    NULL,
    amount
    DECIMAL
(
    10,
    2
) NOT NULL,
    payment_method VARCHAR
(
    50
) NOT NULL,
    status VARCHAR
(
    50
) NOT NULL,
    transaction_id VARCHAR
(
    100
) NOT NULL UNIQUE,
    payment_date DATETIME NOT NULL
    );

INSERT INTO payments (order_id, user_id, amount, payment_method, status, transaction_id, payment_date)
VALUES (1, 3, 43.99, 'CREDIT_CARD', 'SUCCESS', 'TXN-76839210-MOCK', NOW()) ON DUPLICATE KEY
UPDATE transaction_id=transaction_id;
