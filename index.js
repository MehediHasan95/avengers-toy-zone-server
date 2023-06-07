const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

const client = new MongoClient(
  `mongodb+srv://${process.env.BUCKET_NAME}:${process.env.SECRET_KEY}@cluster0.hfakwfc.mongodb.net/?retryWrites=true&w=majority`,
  {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  }
);

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");
    app.get("/", (req, res) => res.send("AvengersToyZone Server is Running"));

    const toyCollection = client
      .db("avengersToyZone")
      .collection("toyCollection");

    // POST TOY METHOD
    app.post("/alltoys", async (req, res) => {
      const data = req.body;
      const result = await toyCollection.insertOne(data);
      res.send(result);
    });
  } finally {
    app.listen(port, () =>
      console.log("AvengersToyZone Server is Running Port: ", port)
    );
  }
}
run().catch(console.dir);
