const { rateLimit } = require("express-rate-limit");

exports.limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  message: { success: false, message: "Too many requests from this IP, please try again later." },
  standardHeaders: true, 
  legacyHeaders: false, 
  keyGenerator: (req) => {
    // Extract actual client IP from Nginx headers if present
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    return req.ip;
  },
});

