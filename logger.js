const winston = require('winston');

const { combine, timestamp, colorize, simple, json } = winston.format;
const logger = winston.createLogger({
  exitOnError: true,
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      format: combine(colorize(), timestamp(), simple()),
    }),
  ],
});

if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'server.log',
      format: combine(timestamp(), json()),
    }),
  );
  logger.exceptions.handle(
    new winston.transports.File({ filename: 'exceptions.log' }),
  );
}

module.exports = logger;
