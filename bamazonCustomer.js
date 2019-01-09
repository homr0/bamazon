// Requirements
var inquirer = require("inquirer");
var mysql = require("mysql");
var cTable = require("console.table");

// Global variables
var connection = mysql.createConnection({
    host: "localhost",
    port: 3307,
    user: "root",
    password: "root",
    database: "bamazon"
});

var checkQuantity = (input) => {
    return new Promise(function(resolve, reject) {
        if(isNaN(input)) {
            reject("This is not a number.");
        } else if(parseInt(input) < 0) {
            reject("You should add at least one of this product.");
        } else {
            resolve(true);
        }
    });
}

// Connects to database. 
connection.connect(function(err) {
    if(err) throw err;
    // console.log("connected as id " + connection.threadId);
    bamazonInit();
});

// Initial screen for Bamazon.
var bamazonInit = () => {
    console.log("Welcome to Bamazon!");
    bamazonAll();
}

// Shows all products from Bamazon.
var bamazonAll = () => {
    connection.query("SELECT item_id AS 'Item ID', product_name AS Name, price AS Price FROM products", function(err, res) {
        if (err) throw err;

        console.log("----- ALL BAMAZON PRODUCTS -----\n");
        console.table(res);
        console.log("Choose which product(s) you would like to order.")

        bamazonOrder();
    });
}

// Allows user to order a Bamazon product.
var bamazonOrder = () => {
    inquirer.prompt([
        {
            type: "input",
            message: "Product ID:",
            name: "item"
        },

        {
            type: "input",
            message: "Quantity:",
            validate: (input) => checkQuantity(input),
            name: "quantity"
        }
    ]).then((inquiry) => {
        // Gets the product information.
        connection.query("SELECT product_name, price, stock_quantity, product_sales FROM products WHERE ?", {
            item_id: inquiry.item
        }, function(err, res) {
            if (err) throw err;

            if(res.length > 0) {
                // If the quantity ordered is less than what is in stock, then update the quantity.
                var item = res[0];
                var remaining = item.stock_quantity - parseInt(inquiry.quantity);
                if(remaining >= 0) {
                    connection.query("UPDATE products SET ? WHERE ?", [
                        {
                            stock_quantity: remaining,
                            product_sales: parseFloat(inquiry.quantity * item.price).toFixed(2) + parseFloat(item.product_sales)
                        },

                        {
                            item_id: inquiry.item
                        }
                    ], function(err, res) {
                        if(err) throw err;

                        // Tells the user how much their purchase was.
                        console.log("You bought "
                        + inquiry.quantity + " "
                        + item.product_name
                        + ((inquiry.quantity > 1) ? "s " : " ") 
                        + "for $"
                        + (parseFloat(inquiry.quantity * item.price).toFixed(2))
                        + ".");
                        bamazonEnd();
                    });
                } else {
                    console.log("Insufficient quantity!\nPlease try ordering again with a smaller quantity.");
                    bamazonOrder();
                }
            } else {
                console.log("That is not a valid product ID.");
                bamazonOrder();
            }
        });
    });
}

// Ends the Bamazon application and closes the connection.
var bamazonEnd = () => {
    // Asks if the user wants to order another item or if they are done ordering.
    inquirer.prompt([
        {
            type: "confirm",
            message: "Would you like to place another order?",
            name: "order"
        }
    ]).then((restart) => {
        if(restart.order) {
            bamazonOrder();
        } else {
            console.log("Thank you for shopping at Bamazon!");
            connection.end();
        }
    });
}