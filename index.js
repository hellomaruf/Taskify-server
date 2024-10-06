const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
  const taskCollection = client.db("TaskifyDB").collection("tasks");

  // Create user--------------->
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

  // Create Task-------------->
  app.post("/tasks", async (req, res) => {
    const task = req.body;
    const result = await taskCollection.insertOne(task);
    res.send(result);
  });

  app.patch("/subtask/:title", async (req, res) => {
    const body = req.body;
    const subtask = body.subtask;

    const title = req.params.title;
    console.log(title);
    const filter = { title: title };
    const updateDoc = {
      $push: { subtask: subtask },
    };
    const result = await taskCollection.updateOne(filter, updateDoc);
    res.send(result);
  });

  // get task
  app.get("/allTask/:email", async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const result = await taskCollection.find(query).toArray();
    res.send(result);
  });

  // delete a task
  app.delete("/deleteRootTask/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await taskCollection.deleteOne(query);
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
