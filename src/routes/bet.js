const express = require("express");
const { PrismaClient } = require("@prisma/client"); // Import PrismaClient
const authMiddleware = require("../middleware/authMiddleware");
// const authMiddleware = require("../middleware/authMiddleware");
const prisma = new PrismaClient();
const router = express.Router();

// Helper function to format the date
const formatDate = (date) => {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
};

// Object for valid names
const VALID_NAMES = {
  BTCUSDT: {
    pair1: "BTC",
    pair2: "USDT",
    icon: "https://logos-world.net/wp-content/uploads/2020/08/Bitcoin-Logo.png",
  },
  ETHUSDT: {
    pair1: "ETH",
    pair2: "USDT",
    icon: "https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/512/Ethereum-ETH-icon.png",
  },
};

// Get active betting questions route
router.get("/questions", authMiddleware, async (req, res) => {
  try {
    const { pair } = req.query;
    console.log("pair: ", pair);

    // Find all betting questions where expiry_time is in the future (i.e., not expired)
    const questions = await prisma.bettingQuestion.findMany({
      where: {
        crypto: pair,
        // expiry_time: {
        //   gt: new Date(), // Only fetch questions that haven't expired
        // },
      },
    });

    if (!questions.length) {
      return res.status(404).json({ message: "No active questions found" });
    }

    // Format the questions for the response
    const formattedQuestions = questions
      .map((question) => {
        const validName = VALID_NAMES[question.crypto];
        if (!validName) {
          return null; // Skip questions with invalid crypto symbols
        }
        return {
          id: question.id,
          text: `${validName.pair1} price be $${question.target_price} ${
            validName.pair2
          } or higher at ${formatDate(question.expiry_time)}?`,
          current_price: question.current_price,
          target_price: question.target_price,
          expiry_time: formatDate(question.expiry_time), // Format expiry date
          icon: validName?.icon,
        };
      })
      .filter((question) => question !== null); // Remove any null entries

    res.status(200).json({ questions: formattedQuestions });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/allbets", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    // Find all betting questions where expiry_time is in the future (i.e., not expired)
    const allbets = await prisma.bet.findMany({
      where: {
        user_id: userId,
      },
      include: {
        BettingQuestion: {
          select: {
            id: true,
            crypto: true,
            current_price: true,
            target_price: true,
            expiry_time: true,
          },
        },
      },
    });

    if (!allbets.length) {
      return res.status(404).json({ message: "No active questions found" });
    }

    const formattedQuestions = allbets
      .map((bet) => {
        const validName = VALID_NAMES[bet?.BettingQuestion?.crypto];
        if (!validName) {
          return null; // Skip questions with invalid crypto symbols
        }
        return {
          ...bet,
          text: `${validName.pair1} price be $${
            bet?.BettingQuestion?.target_price
          } ${validName.pair2} or higher at ${formatDate(
            bet?.BettingQuestion?.expiry_time
          )}?`,
          current_price: bet?.BettingQuestion?.current_price,
          target_price: bet?.BettingQuestion?.target_price,

          icon: validName?.icon,
        };
      })
      .filter((question) => question !== null); // Remove any null entries

    res.status(200).json({ allbets: formattedQuestions });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/create-bet", authMiddleware, async (req, res) => {
  try {
    const userId = req?.user?.id;

    const { questionId, amount, side } = req.body;

    // Validate inputs
    if (!userId || !questionId || !amount || !side) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create a new bet
    const newBet = await prisma.bet.create({
      data: {
        user_id: userId,
        question_id: questionId,
        amount: parseFloat(amount),
        side: side, // Adjust side logic if needed
        isMatched: false, // Default isMatched to false
      },
    });

    return res.status(201).json({ success: true, bet: newBet });
  } catch (error) {
    console.error("Error creating bet:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
