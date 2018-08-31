const winston = require('winston');

const { combine, timestamp, colorize, simple, json } = winston.format;
const logger = winston.createLogger({
  exitOnError: true,
  transports: [
    new winston.transports.File({
      filename: 'server.log',
      format: combine(timestamp(), json()),
    }),
    new winston.transports.Console({
      handleExceptions: true,
      format: combine(colorize(), timestamp(), simple()),
    }),
  ],
});

module.exports = logger;
