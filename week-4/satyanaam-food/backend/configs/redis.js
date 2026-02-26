const redis = require("redis");
require("dotenv").config();

const redisUri = process.env.REDIS_URI || "redis://127.0.0.1:6379";
exports.client = redis.createClient({ url: redisUri });

