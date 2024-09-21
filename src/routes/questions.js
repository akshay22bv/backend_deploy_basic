const express = require("express");
const { Op } = require("sequelize"); // Import Op for OR condition
const BettingQuestion = require("../model/BettingQuestion");

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
router.get("/questions", async (req, res) => {
  try {
    const { pair } = req.query;
    console.log("pair: ", pair);
    // Find all betting questions where expiry_time is in the future (i.e., not expired)
    const questions = await BettingQuestion.findAll({
      where: {
        crypto: pair,
        expiry_time: {
          [Op.gt]: new Date(), // Only fetch questions that haven't expired
        },
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

    console.log("formattedQuestions: ", formattedQuestions);
    res.status(200).json({ questions: formattedQuestions });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
