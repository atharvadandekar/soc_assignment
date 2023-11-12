const express = require('express');
const { Pool, Client } = require("pg");

const app = express();
const port = process.env.PORT || 3200;
app.listen(port, () => {
console.log(`running at port ${port}`);
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* Postgress db connection steps */
const credentials = {
  user: "postgres",
  host: "localhost",
  database: "db1",
  password: "postgres",
  port: 5432,
};

const client = new Client(credentials);
client.connect();

// Get garments
app.get("/garments", (req, res) => {
  try {
    client.query("select * from garments", (err, data) => {
      if (err) throw err;
      res.status(200).json({
        garments: data.rows
      });
    });
  } catch (error) {
    res.status(500).json({
      err: error.message,
      garments: null
    });
  }
});

// Delete garment by using id
app.delete("/garments/:id", (req,res) => {
const garmentsId = req.params.id;
   try {
    client.query(" delete from garments where id=$1", [garmentsId], (err, data) => {
      if (err) throw err;
      res.status(201).json({
          message: "Succesfully deleted garment"
        });
    });
  } catch (error) {
    res.status(500).json({
      err: error.message,
      garments: null
    });
  }
});

// update garment size by using id
app.patch("/garments/:id", (req,res) => {
const garmentsId = req.params.id;
const garmentSize = req.body;
   try {
    client.query(" UPDATE garments SET size = $1 WHERE id=$2", [ garmentSize,garmentsId], (err, data) => {
      if (err) throw err;
      res.status(201).json({
          message: "Updated garment size"
        });
    });
  } catch (error) {
    res.status(500).json({
      err: error.message,
      garments: null
    });
  }
});

// Get jeans
app.get("/jeans", (req, res) => {
  try {
    client.query("select * from garments where type='Jeans'", (err, data) => {
      if (err) throw err;
      res.status(200).json({
        garments: data.rows
      });
    });
  } catch (error) {
    res.status(500).json({
      err: error.message,
      garments: null
    });
  }
});

// Get shirts
app.get("/shirts", (req, res) => {
  try {
    client.query("select * from garments where type='Shirt'", (err, data) => {
      if (err) throw err;
      res.status(200).json({
        garments: data.rows
      });
    });
  } catch (error) {
    res.status(500).json({
      err: error.message,
      garments: null
    });
  }
});

// Get Tshirts
app.get("/Tshirts", (req, res) => {
  try {
    client.query("select * from garments where type='Tshirt'", (err, data) => {
      if (err) throw err;
      res.status(200).json({
        garments: data.rows
      });
    });
  } catch (error) {
    res.status(500).json({
      err: error.message,
      garments: null
    });
  }
});

// Post garments
app.post("/garments", (req, res) => {
  try {
    const garment = req.body;
    
    if (!garment) {
      throw Error("Please send garment details in request body");
    }
 
    client.query(
      "INSERT INTO garments (brand, type, color, size, price, id) VALUES ($1,$2,$3,$4,$5,$6)",
      [garment.brand, garment.type, garment.color, garment.size, garment.price, garment.id],
      (err, data) => {
        res.status(201).json({
          message: "Created new garment"
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Failed to create new garment"
    });
  }
});

// Post orders
app.post("/orders", (req, res) => {
  try {
    const order = req.body;
    var order_total =0;
    if (!order) {
      throw Error("Please send order details in request body");
    }
    
  for ( var i = 0; i < order.garments.length; i++) 
  {
   client.query( "SELECT price from garments where id = $1", [order.garments[i]], (err, data) =>
   {
     console.log(data.rows[0].price);
     order_total= order_total + data.rows[0].price;
     
   });
  }
  console.log(order_total);
  
  client.query(
      "INSERT INTO orders (id, garments, payment_status, delivery_status) VALUES ($1,$2,$3,$4,$5)",
      [order.id, JSON.stringify(order.garments), "pending", "pending"],
      (err, data) => {
        var msg = "Initiated new order. Please pay order total:" + order_total;
        res.status(201).json({
          message: msg
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Failed to create new garment"
    });
  }  
});

//Register user
app.post("/registerUser", (req, res) => {
    try {
    const user = req.body;
    
    if (!user) {
      throw Error("Please send user details in request body");
    }
 
    client.query(
      "INSERT INTO users (user_id, password) VALUES ($1,$2)",
      [user.user_id, user.password],
      (err, data) => {
        res.status(201).json({
          message: "Registered new user"
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Failed to register new user"
    });
  }
});

// Login and authentication
app.post("/login", (req, res) => {
    try {
    const user = req.body;
    
    if (!user) {
      throw Error("Please send user details in request body");
    }
 
    client.query(
      "select password from users where user_id = $1",
      [user.user_id],
      (err, data) => {
      if(data.rows[0].password == user.password)
      {
        res.status(200).json({
          message: "Succesfully logged in"
        });
      }
      else
      {
       res.status(400).json({
          message: "Authentication failed"
        });
      }
      }
    );
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Failed to register new user"
    });
  }
});



