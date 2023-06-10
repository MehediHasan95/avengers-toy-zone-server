const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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

const verifyJWT = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .send({ err: true, message: "Unauthorized access token" });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res
      .status(401)
      .send({ err: true, message: "Unauthorized access token" });
  }
};

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    app.get("/", (req, res) => res.send("AvengersToyZone Server is Running"));

    const toyCollection = client
      .db("avengersToyZone")
      .collection("toysCollection");

    // JWT POST METHOD
    app.post("/jwt", (req, res) => {
      const data = req.body;
      const token = jwt.sign(data, process.env.ACCESS_SECRET_TOKEN, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    // GET METHOD
    app.get("/alltoys", async (req, res) => {
      const results = await toyCollection.find({}).toArray();
      res.send(results);
    });

    app.get("/alltoys/:sub", async (req, res) => {
      const results = await toyCollection
        .find({ subCategory: { $eq: req?.params?.sub } })
        .toArray();
      res.send(results);
    });

    // GET SPECIFIC DATA
    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    // GET MY TOYS
    app.get("/mytoys", verifyJWT, async (req, res) => {
      if (req?.query?.uid === req?.decoded?.uid) {
        const results = await toyCollection
          .find({ uid: { $eq: req?.query?.uid } })
          .toArray();
        res.send(results);
      } else {
        res.status(403).send({ err: true, message: "Error Forbidden" });
      }
    });

    app.get("/mytoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.patch("/mytoys/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateToy = {
        $set: {
          name: data.name,
          price: data.price,
          quantity: data.quantity,
          img: data.img,
          description: data.description,
        },
      };
      const result = await toyCollection.updateOne(filter, updateToy);
      res.send(result);
    });

    app.delete("/mytoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    // POST METHOD
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
