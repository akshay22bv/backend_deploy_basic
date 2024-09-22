const schedule = require("node-schedule");
const axios = require("axios");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const percent = 0.01; // Percentage for target price increase

const isOnserver = process.env.NODE_ENV === "server";

// if (isOnserver) {
const job = schedule.scheduleJob("*/1 * * * *", async () => {
  try {
    const assets = ["BTCUSDT", "ETHUSDT"];

    // Fetch the current cryptocurrency prices
    const pricePromises = assets.map(async (item) => {
      try {
        const response = await axios.get(
          `https://api.binance.com/api/v3/ticker/price?symbol=${item}`
        );
        // console.log("response: ", response);
        return { symbol: item, price: parseFloat(response.data.price) };
      } catch (error) {
        console.error(`Error fetching price for ${item}:`, error.message);
        return null; // Return null or handle the error as needed
      }
    });

    // Resolve all price fetch promises
    const prices = await Promise.all(pricePromises);
    console.log("prices: ", prices);

    // Filter out any null responses (in case of errors)
    const validPrices = prices.filter((price) => price !== null);
    console.log("validPrices: ", validPrices);

    // Save the betting questions with the current prices and expiry time
    const createPromises = validPrices.map(async ({ symbol, price }) => {
      const targetPrice = price * (1 + percent / 100);

      // Get the current time and add 10 minutes to it
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 10);

      return prisma.bettingQuestion.create({
        data: {
          crypto: symbol,
          current_price: price,
          target_price: targetPrice,
          expiry_time: expiryTime, // Set expiry time 10 minutes from now
        },
      });
    });

    // Resolve all create promises
    await Promise.all(createPromises);

    console.log("Betting questions saved with current prices and expiry time.");
  } catch (error) {
    console.error("Error occurred, transaction rolled back:", error.message);
  }
});
// }
