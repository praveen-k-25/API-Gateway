const logger = require("../utils/logger");

const asyncHandler = (fn) => (res, req, next) => {
  Promise.resolve(fn(res, req, next).catch(next));
};

const GlobalErrorHandler = (err, req, res, next) => {
  logger.error(err || "Internal Server Error");

  return res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
};

module.exports = {asyncHandler, GlobalErrorHandler};
