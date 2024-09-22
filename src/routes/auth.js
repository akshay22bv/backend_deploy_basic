const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient, Prisma } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.send({ users });
  } catch (error) {}
});

// Add a new user
router.post("/signup", async (req, res) => {
  const { username, email, password, phone } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("hashedPassword: ", hashedPassword);

    // Create the user with the correct structure
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
        phone: phone.toString(),
        balance: 0.0, // Set initial balance to 0.00 as per your model
      },
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(400).json({
          error: `Unique constraint violation, a user with this ${error.meta.target} already exists`,
        });
      }
    }

    // For any other errors
    console.log("error: ", error);
    res.status(500).json({ error: error.message });
  }
});

// login
router.post("/login", async (req, res) => {
  const { emailOrPhone, password } = req.body;

  try {
    // Check if the user exists by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrPhone }, { phone: emailOrPhone }],
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

    // Send token along with additional user information
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
