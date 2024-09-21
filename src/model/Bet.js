// models/Bet.js
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize_config");
const User = require("./User");
const BettingQuestion = require("./BettingQuestion");

class Bet extends Model {}

Bet.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    question_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: BettingQuestion,
        key: "id",
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
    },

    side: {
      type: DataTypes.ENUM("yes", "no"),
      allowNull: false,
    },

    result: {
      type: DataTypes.ENUM("win", "lost"),
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
    modelName: "Bet",
  }
);

User.hasMany(Bet, { foreignKey: "user_id" });
BettingQuestion.hasMany(Bet, { foreignKey: "question_id" });
Bet.belongsTo(User, { foreignKey: "user_id" });
Bet.belongsTo(BettingQuestion, { foreignKey: "question_id" });

module.exports = Bet;
