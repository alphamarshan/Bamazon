var mysql = require("mysql");
var inquirer = require("inquirer");

// You will need your own username/password to access the mySQL database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});

function start() {
  console.log("Welcome to the Bamazon Store!\n");
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;

    for (var i = 0; i < res.length; i++) {
      console.log("ID: " + res[i].item_id + "\nProduct: " + res[i].product_name + "\nDepartment: " + res[i].department_name + "\nPrice: $" + res[i].product_price + "\nQuantity: " + res[i].stock_quantity + "\n");
    }

    promptItems();

  })
}

function promptItems() {
  inquirer
    .prompt([{
      name: "id",
      type: "input",
      message: "What is the ID of the product you would like to buy?"
    }, {
      name: "quantity",
      type: "input",
      message: "And how many units of that would you like?"
    }])
    .then(function(answer) {
      productID = answer.id;
      quantity = answer.quantity;

      connection.query('SELECT * FROM products WHERE ?', {
        item_id: productID
      }, function (err, res) {
        if (err) throw err;

        // console.log(answer.quantity);

        connection.query('SELECT item_id, product_name, product_price, stock_quantity FROM products WHERE item_id= ' + productID,
          function (err, res) {
            if (err) throw err;
            if (res[0].stock_quantity < quantity) {
              console.log("Insufficient Quantity!");
            } else {
              connection.query("UPDATE products SET ? WHERE ?", [{
                  stock_quantity: res[0].stock_quantity - quantity
                }, {
                  item_id: productID
                }],
                function (err, result) {});
              if (quantity === '1') {
                console.log("Total: $" + (res[0].product_price * quantity) + " for your purchase of " + quantity + " " + res[0].product_name);
              } else {
                console.log("Total: $" + (res[0].product_price * quantity) + " for your purchase of " + quantity + " " + res[0].product_name);
              }
              console.log("Inventory has been updated." + "\n Thank you for shopping with us!" + "\n_____________________________________");
              start();
            }
          });
      });
    });
}
