// models/User.js
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize_config"); // assuming you have a config file for sequelize

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
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
    modelName: "User",
  }
);

module.exports = User;
