const mongoose = require("mongoose");

const connectDB = async () => {
  const url = process.env.DB_CONNECTION_STRING;
  if (!url) {
    throw new Error("DB_CONNECTION_STRING is not set in environment");
  }
  await mongoose.connect(url);
};

module.exports = connectDB;