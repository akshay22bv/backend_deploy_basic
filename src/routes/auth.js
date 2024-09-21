// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize"); // Import Op for OR condition
const User = require("../model/User");

const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
  const { username, email, password, phone } = req.body;

  try {
    // Check if the email or phone already exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: "Email already in use" });
    }

    user = await User.findOne({ where: { phone } });
    if (user) {
      return res.status(400).json({ message: "Phone number already in use" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("hashedPassword: ", hashedPassword);

    // Create the user
    user = await User.create({
      username,
      email,
      passwordHash: hashedPassword,
      phone,
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { emailOrPhone, password } = req.body;
  console.log("emailOrPhone: ", emailOrPhone);

  try {
    // Check if the user exists by email or phone
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    console.log("isMatch: ", isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign({ id: user.id }, "your_jwt_secret", {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
