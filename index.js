const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

async function run() {
  try {
    app.get("/", (req, res) => res.send("AvengersToyZone Server is Running"));
  } finally {
    app.listen(port, () =>
      console.log("AvengersToyZone Server is Running Port: ", port)
    );
  }
}
run().catch(console.dir);
