-- Bamazon Database --
DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

-- Product Table --
CREATE TABLE products(
    item_id INT(10) NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(30) NOT NULL,
    department_name VARCHAR(30),
    price FLOAT(10) NOT NULL,
    stock_quantity INT(10) NOT NULL,
    PRIMARY KEY(item_id)
);

INSERT INTO products(product_name, department_name, price, stock_quantity)
    VALUES ("Rilakkuma plush", "toys and games", 24.99, 10),
    ("Medium aquarium tank", "pet supplies", 79.99, 12),
    ("Maroon sherpa throw", "home and kitchen", 16.49, 20),
    ("Raccoon chew toy", "pet supplies", 14.98, 6),
    ("Printer paper 500-sheets pack", "office supplies", 8.99, 9),
    ("Sharpie pens variety pack", "office supplies", 10.99, 21),
    ("Micro USB cable", "electronics", 4.99, 97),
    ("Gloomhaven", "toys and games", 139.99, 4),
    ("Throw pillow", "home and kitchen", 12.99, 34),
    ("Power strip", "electronics", 6.99, 8);