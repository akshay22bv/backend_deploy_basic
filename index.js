// server.js
require("dotenv").config(); //
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json()); // To parse incoming JSON requests

app.use(cors());

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

app.get("/", (req, res) => {
  res.send(`deployed  running on port ${PORT}`);
});

app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.send({ users });
  } catch (error) {}
});

// Add a new user
app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
      },
    });
    res.status(201).send({ user: newUser });
  } catch (error) {
    res.status(500).send({ error: "Failed to create user" });
  }
});

// Start the server
const PORT = process.env.PORT || 6000;
console.log("PORT: ", PORT);

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});
