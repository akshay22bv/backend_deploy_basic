// server.js
require("dotenv").config(); //
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./src/routes/auth"); // Import authentication routes
const questionRoutes = require("./src/routes/questions"); // Import authentication routes
const sequelize = require("./src/config/sequelize_config"); // Import Sequelize instance

// const Bet = require("./src/model/Bet");
require("./src"); // Import the job

const app = express();
app.use(bodyParser.json()); // To parse incoming JSON requests

// Use the auth routes
app.use("/api/auth", authRoutes);
app.use("/api", questionRoutes);
app.use(cors());

app.get("/", (req, res) => {
  res.send(`Server running on port ${PORT}`);
});

// Start the server
const PORT = process.env.PORT || 6000;
console.log("PORT: ", PORT);

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Test database connection and sync models
  try {
    await sequelize.authenticate();
    console.log("Database connected...");
    await sequelize.sync(); // Sync models with database
  } catch (error) {
    // console.error("Unable to connect to the database:", error);
  }
});

// async function createWalletTable(item) {
//   try {
//     await Bet.sync({ force: true }); // Use { force: true } to drop existing table and recreate
//     console.log(` table created successfully`);
//   } catch (error) {
//     console.error(`Error creating  table:", error`);
//   } finally {
//     await sequelize.close(); // Close the Sequelize connection when done
//   }
// }
