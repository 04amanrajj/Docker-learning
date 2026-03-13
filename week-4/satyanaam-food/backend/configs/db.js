const mongoose = require("mongoose");
require("dotenv").config();

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/restaurent";

const connectWithRetry = async () => {
  const options = {
    serverSelectionTimeoutMS: 5000 
  };
  
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    try {
      attempts++;
      console.log(`🔌 [Database Connection] Attempting MongoDB connection (${attempts}/${maxAttempts})...`);
      await mongoose.connect(mongoUri, options);
      console.log("✓ [Database Connection] MongoDB connected successfully.");
      return;
    } catch (err) {
      console.error(`❌ [Database Connection] Failed on attempt ${attempts}. Error: ${err.message}`);
      if (attempts >= maxAttempts) {
        throw new Error("Could not connect to MongoDB after maximum retry attempts");
      }
      console.log("⏳ [Database Connection] Retrying in 5 seconds...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

exports.dbconnection = connectWithRetry();


