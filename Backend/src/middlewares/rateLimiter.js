const rateLimit = require('express-rate-limit');

const requestRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skipSuccessfulRequests: true,
  message: 'Too many failed requests from this IP address, please try again later',
});

module.exports = { requestRateLimiter };
