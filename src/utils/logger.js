const winston = require("winston");

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(  // common log format
    winston.format.json(),
    winston.format.splat(),
    winston.format.errors({stack: true}),
    winston.format.timestamp()
  ),
  defaultMeta: {Service: "API GATEWAY"},
  transports: [
    new winston.transports.Console({ // format for console log
      format: winston.format.combine(  
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.timestamp()
      ),
    }),
    new winston.transports.File({filename: "error.log", level: "error"}), // log saved in error.log File
    new winston.transports.File({filename: "combined.log"}),  // log saved in combined.log
                                            
  ],
});

module.exports = logger;