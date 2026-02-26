const mongoose = require("mongoose");
require("dotenv").config();

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/restaurent";
exports.dbconnection = mongoose.connect(mongoUri);

