// models/BettingQuestion.js
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize_config");

class BettingQuestion extends Model {}

BettingQuestion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    crypto: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "e.g. BTC, ETH",
    },

    current_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    target_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    expiry_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW, // Sets the current date and time as default
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW, // Sets the current date and time as default
    },
  },
  {
    sequelize,
    modelName: "BettingQuestion",
  }
);

module.exports = BettingQuestion;
