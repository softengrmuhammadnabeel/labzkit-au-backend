const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  let uri =
    process.env.MODE === "development"
      ? process.env.MONGODB_URI_DEV
      : process.env.MONGODB_URI_PROD;
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
