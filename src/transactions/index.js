const schedule = require("node-schedule");
const axios = require("axios");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const percent = 0.01; // Percentage for target price increase

const isOnserver = process.env.NODE_ENV === "server";

// if (isOnserver) {
// const job = schedule.scheduleJob("*/1 * * * *", async () => {
//   try {
//     const assets = ["BTCUSDT", "ETHUSDT"];

//     // Fetch the current cryptocurrency prices
//     const pricePromises = assets.map(async (item) => {
//       try {
//         const response = await axios.get(
//           `https://api.binance.com/api/v3/ticker/price?symbol=${item}`
//         );
//         // console.log("response: ", response);
//         return { symbol: item, price: parseFloat(response.data.price) };
//       } catch (error) {
//         console.error(`Error fetching price for ${item}:`, error.message);
//         return null; // Return null or handle the error as needed
//       }
//     });

//     // Resolve all price fetch promises
//     const prices = await Promise.all(pricePromises);
//     console.log("prices: ", prices);

//     // Filter out any null responses (in case of errors)
//     const validPrices = prices.filter((price) => price !== null);
//     console.log("validPrices: ", validPrices);

//     // Save the betting questions with the current prices and expiry time
//     const createPromises = validPrices.map(async ({ symbol, price }) => {
//       const targetPrice = price * (1 + percent / 100);

//       // Get the current time and add 10 minutes to it
//       const expiryTime = new Date();
//       expiryTime.setMinutes(expiryTime.getMinutes() + 10);

//       return prisma.bettingQuestion.create({
//         data: {
//           crypto: symbol,
//           current_price: price,
//           target_price: targetPrice,
//           expiry_time: expiryTime, // Set expiry time 10 minutes from now
//         },
//       });
//     });

//     // Resolve all create promises
//     await Promise.all(createPromises);

//     console.log("Betting questions saved with current prices and expiry time.");
//   } catch (error) {
//     console.error("Error occurred, transaction rolled back:", error.message);
//   }
// });
// }

const markMatchedBets = async (questionId) => {
  try {
    // Fetch all bets for the given question ID
    const bets = await prisma.bet.findMany({
      where: {
        question_id: questionId,
        isMatched: false, // Only check unmatched bets
      },
    });

    // Group bets by side
    const yesBets = bets.filter((bet) => bet.side === "yes");
    const noBets = bets.filter((bet) => bet.side === "no");

    // Check if any yes bet amount plus any no bet amount equals 10
    yesBets.forEach(async (yesBet) => {
      noBets.forEach(async (noBet) => {
        if (parseFloat(yesBet.amount) + parseFloat(noBet.amount) === 10) {
          // Mark both bets as matched
          yesBet.isMatched = true;
          noBet.isMatched = true;

          // Update the bets in the database
          await prisma.bet.update({
            where: { id: yesBet.id },
            data: { isMatched: true },
          });
          await prisma.bet.update({
            where: { id: noBet.id },
            data: { isMatched: true },
          });
        }
      });
    });
  } catch (error) {
    console.error("Error marking matched bets:", error);
  }
};

const job = schedule.scheduleJob("*/1 * * * *", async () => {
  try {
    // Save the betting questions with the current prices and expiry time

    // Mark matched bets for each question (you might want to loop through all questions)
    const questions = await prisma.bettingQuestion.findMany(); // Adjust as necessary
    for (const question of questions) {
      await markMatchedBets(question.id);
    }

    console.log("Betting questions saved with current prices and expiry time.");
  } catch (error) {
    console.error("Error occurred, transaction rolled back:", error.message);
  }
});
