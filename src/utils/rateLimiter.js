const logger = require("./logger");

const GatewayRateLimiterStore = new Map();

const gatewayRateLImiter = async (req, res, next) => {
  const ip = req.ip;
  const windowSize = 15 * 60 * 1000;
  const limitCount = 50;
  const timestamp = Date.now();

  if (!GatewayRateLimiterStore.has(ip)) {
    GatewayRateLimiterStore.set(ip, {count: 1, timestamp: timestamp});
    return next();
  }
  const {count, timestamp: lastRequestTime} = GatewayRateLimiterStore.get(ip);
  if (timestamp - lastRequestTime > windowSize) {
    GatewayRateLimiterStore.set(ip, {count: 1, timestamp: timestamp});
    return next();
  } else if (count <= limitCount) {
    GatewayRateLimiterStore.set(ip, {count: count + 1, timestamp: timestamp});
  } else {
    logger.info("Rate limit exceeded from API GateWAY", GatewayRateLimiterStore.get(ip));
    return res.status(429).json({error: "Rate limit exceeded"});
  }
  next();
};

module.exports = gatewayRateLImiter;
