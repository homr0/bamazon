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
    bamazonDepartments();
});

// Shows all of the supervisor options.
var bamazonDepartments = () => {
    inquirer.prompt([
        {
            type: "list",
            message: "--- BAMAZON SUPERVISOR MENU ---",
            choices: [
                "View Products Sales by Department",
                "Create New Department"
            ],
            name: "option"
        }
    ]).then((inquiry) => {
        switch(inquiry.option) {
            case "View Products Sales by Department":
                bamazonDepartmentSales();
                break;
            case "Create New Department":
                bamazonDepartmentNew();
                break;
        }
    });
}

// Allows the user to view product sales by department.
var bamazonDepartmentSales = () => {
    connection.query("SELECT departments.department_id,departments.department_name, FORMAT(departments.over_head_costs, 2) AS over_head_costs, FORMAT(COALESCE(SUM(products.product_sales), 0), 2) AS product_sales, FORMAT(COALESCE(SUM(products.product_sales), 0) - departments.over_head_costs, 2) AS total_profit FROM departments LEFT JOIN products ON departments.department_name=products.department_name GROUP BY departments.department_name ORDER BY departments.department_id", function(err, res) {
        if(err) throw err;

        console.table("--------- BAMAZON DEPARTMENT SALES ---------", res);

        bamazonLeave();
    });
}

// Allows the user to create a new department.
var bamazonDepartmentNew = () => {
    inquirer.prompt([
        {
            type: "input",
            message: "Department Name:",
            name: "name"
        },

        {
            type: "input",
            message: "Overhead Costs ($):",
            validate: (input) => checkPrice(input),
            name: "overhead"
        }
    ]).then((inquiry) => {
        connection.query("INSERT INTO departments SET ?", {
            department_name: inquiry.name.toLowerCase(),
            over_head_costs: inquiry.overhead
        }, function(err, res) {
            if(err) throw err;

            console.log("Added "
                + inquiry.name + " department with an overhead cost of $"
                + inquiry.overhead + ".");

            bamazonLeave();
        });
    });
}

// Prompts the user if they want to do anything else.
var bamazonLeave = () => {
    inquirer.prompt(
        {
            type: "confirm",
            message: "Do you have any other department tasks you need to do?",
            name: "goToMenu"
        }
    ).then((inquiry) => {
        if(inquiry.goToMenu) {
            bamazonDepartments();
        } else {
            console.log("Logging off...");
            connection.end();
        }
    });
}