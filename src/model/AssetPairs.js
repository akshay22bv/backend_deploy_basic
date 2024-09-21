// models/AssetPairs.js
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize_config");

class AssetPairs extends Model {}

AssetPairs.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    pair: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "e.g. BTCUSDT",
    },
    name: {
      type: DataTypes.STRING,
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
    modelName: "AssetPairs",
  }
);

module.exports = AssetPairs;
