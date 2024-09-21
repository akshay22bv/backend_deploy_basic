const { Sequelize } = require("sequelize");

// Initialize Sequelize using environment variables

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true, // Ensure SSL connection on production
      rejectUnauthorized: false, // If Vercel requires SSL, this bypasses certificate validation
    },
  },
});

module.exports = sequelize;
