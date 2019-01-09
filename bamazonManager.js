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

var checkPrice = (input) => {
    return new Promise(function(resolve, reject) {
        if(isNaN(input)) {
            reject("This is not a number.");
        } else if(parseFloat(input) < 0) {
            reject("You should have a nonnegative price for this product.");
        } else {
            resolve(true);
        }
    });
}

// Connects to database. 
connection.connect(function(err) {
    if(err) throw err;
    // console.log("connected as id " + connection.threadId);
    bamazonMenu();
});

// Shows all of the manager options.
var bamazonMenu = () => {
    inquirer.prompt([
        {
            type: "list",
            message: "--- BAMAZON MANAGER MENU ---",
            choices: [
                "View Products for Sale",
                "View Low Inventory",
                "Add to Inventory",
                "Add New Product"
            ],
            name: "option"
        }
    ]).then((inquiry) => {
        switch(inquiry.option) {
            case "View Products for Sale":
                bamazonInventory();
                break;
            case "View Low Inventory":
                bamazonLowStock();
                break;
            case "Add to Inventory":
                bamazonNewInventory();
                break;
            case "Add New Product":
                bamazonNewProduct();
                break;
        }
    });
}

// Shows all products for sale.
var bamazonInventory = () => {
    connection.query("SELECT item_id AS 'Item ID', product_name AS Name, price AS Price, stock_quantity AS Quantity FROM products", function(err, res) {
        if (err) throw err;

        console.table("----- ALL BAMAZON PRODUCTS -----\n", res);

        bamazonExit();
    });
}

// Shows items that have an inventory count of lower than 5.
var bamazonLowStock = () => {
    connection.query("SELECT item_id, product_name, price, stock_quantity FROM products WHERE stock_quantity < 5", function(err, res) {
        if(err) throw err;

        var products = [];
        for(var i = 0; i < res.length; i++) {
            products.push({
                "Item ID": res[i].item_id,
                "Name": res[i].product_name,
                "Price": res[i].price,
                "Quantity": res[i].stock_quantity
            });
        }

        console.table("----- BAMAZON PRODUCTS THAT NEED TO BE RESTOCKED SOON -----\n", products);

        bamazonExit();
    });
}

// Prompts the user for add more of an item currently in stock.
var bamazonNewInventory = () => {
    inquirer.prompt([
        {
            type: "input",
            message: "Item ID:",
            name: "item"
        },

        {
            type: "input",
            message: "Quantity to add:",
            validate: (input) => checkQuantity(input),
            name: "quantity"
        }
    ]).then((inquiry) => {
        connection.query("SELECT product_name, stock_quantity FROM products WHERE ?", {
            item_id: inquiry.item
        }, function(err, res) {
            if(err) throw err;

            if(res.length > 0) {
                // Adds more of an item in inventory.
                var item = res[0];

                connection.query("UPDATE products SET ? WHERE ?", [
                    {
                        stock_quantity: parseInt(item.stock_quantity) + parseInt(inquiry.quantity)
                    },

                    {
                        item_id: inquiry.item
                    }
                ], function(err, res) {
                    if(err) throw err;

                    console.log("You added "
                    + inquiry.quantity + " "
                    + item.product_name
                    + ((inquiry.quantity > 1) ? "s " : " ")
                    + " to Bamazon.");
                    bamazonExit();
                });
            } else {
                console.log("That is not a valid item ID.");
                bamazonNewInventory();
            }
        });
    });
}

// Prompts user to add a new product.
var bamazonNewProduct = () => {
    inquirer.prompt([
        {
            type: "input",
            message: "Product Name:",
            name: "name"
        },

        {
            type: "input",
            message: "Department:",
            name: "department"
        },

        {
            type: "input",
            message: "Price ($):",
            validate: (input) => checkPrice(input),
            name: "price"
        },

        {
            type: "input",
            message: "Quantity:",
            validate: (input) => checkQuantity(input),
            name: "quantity"
        }
    ]).then((inquiry) => {
        connection.query("INSERT INTO products SET ?", {
            product_name: inquiry.name,
            department_name: inquiry.department.toLowerCase(),
            price: parseFloat(inquiry.price).toFixed(2),
            stock_quantity: parseFloat(inquiry.quantity)
        }, function(err, res) {
            if(err) throw err;

            console.log("Added "
            + inquiry.quantity + " "
            + inquiry.name
            + ((inquiry.quantity > 1) ? "s " : " ") + "for $"
            + parseFloat(inquiry.price).toFixed(2) + " to Bamazon in the "
            + inquiry.department + " department.");

            bamazonExit();
        });
    });
}

// Prompts the user if they want to do anything else.
var bamazonExit = () => {
    inquirer.prompt(
        {
            type: "confirm",
            message: "Do you have any other tasks you need to do?",
            name: "goToMenu"
        }
    ).then((inquiry) => {
        if(inquiry.goToMenu) {
            bamazonMenu();
        } else {
            console.log("Logging off...");
            connection.end();
        }
    });
}