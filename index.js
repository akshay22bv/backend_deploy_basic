// server.js
require("dotenv").config(); //
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authRoutes = require("./src/routes/auth"); // Import authentication routes
const questionRoutes = require("./src/routes/bet");
const app = express();
app.use(bodyParser.json()); // To parse incoming JSON requests
require("./src"); // Import the job
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api", questionRoutes);

app.get("/", (req, res) => {
  res.send(`deployed  running on port ${PORT}`);
});

// Start the server
const PORT = process.env.PORT || 6000;
console.log("PORT: ", PORT);

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});
