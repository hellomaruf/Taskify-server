const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 3000;

//middleware
app.use(express.json());
app.use(express.urlencoded());
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  // credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

console.log(process.env.USER);

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.0o9qayn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  const usersCollection = client.db("TaskifyDB").collection("users");

  app.post("/users", async (req, res) => {
    const users = req.body;
    const query = { email: users?.email };
    const existingUser = await usersCollection.findOne(query);
    if (existingUser) {
      return res.send({ message: "User is already Exist", insertedId: null });
    }
    const result = await usersCollection.insertOne(users);
    res.send(result);
  });

  try {
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Taskify server is Running......");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
