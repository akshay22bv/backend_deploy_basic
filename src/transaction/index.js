const schedule = require("node-schedule");
const axios = require("axios");
const BettingQuestion = require("../model/BettingQuestion");
const sequelize = require("../config/sequelize_config");
const AssetPairs = require("../model/AssetPairs");

const percent = 0.01; // Percentage for target price increase

const job = schedule.scheduleJob("*/5 * * * *", async () => {
  const transaction = await sequelize.transaction(); // Start transaction
  try {
    const assets = await AssetPairs.findAll({});

    // Fetch the current cryptocurrency prices
    const pricePromises = assets.map(async (item) => {
      try {
        const response = await axios.get(
          `https://api.binance.com/api/v3/ticker/price?symbol=${item.pair}`
        );
        return { symbol: item.pair, price: response.data.price };
      } catch (error) {
        console.error(`Error fetching price for ${item.pair}:`, error.message);
        return null; // Return null or handle the error as needed
      }
    });

    // Resolve all price fetch promises
    const prices = await Promise.all(pricePromises);
    console.log("prices: ", prices);

    // Filter out any null responses (in case of errors)
    const validPrices = prices.filter((price) => price !== null);

    // Save the betting questions with the current prices and expiry time
    const createPromises = validPrices.map(async ({ symbol, price }) => {
      const targetPrice = price * (1 + percent / 100);

      // Get the current time and add 10 minutes to it
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 10);

      return BettingQuestion.create(
        {
          crypto: symbol,
          current_price: price,
          target_price: targetPrice,
          percent: percent,
          expiry_time: expiryTime, // Set expiry time 10 minutes from now
        },
        { transaction } // Pass transaction
      );
    });

    // Resolve all create promises
    await Promise.all(createPromises);

    // Commit the transaction if everything goes well
    await transaction.commit();
    console.log("Betting questions saved with current prices and expiry time.");
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();
    console.error("Error occurred, transaction rolled back:", error.message);
  }
});
