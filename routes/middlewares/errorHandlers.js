const logger = require('../../logger');

module.exports = {
  mongooseValidation: (err, req, res, next) => {
    if (err.name === 'ValidationError') {
      const response = { errors: {} };
      Object.keys(err.errors).forEach(errKey => {
        response.errors[errKey] = err.errors[errKey].message;
      });
      return res.status(422).json(response);
    }
    return next(err);
  },
  global: (err, req, res, next) => {
    logger.error(err.stack);
    res.status(err.status || 500).json({
      errors: {
        error: process.env.NODE_ENV === 'production' ? {} : err.stack,
        message: err.message,
      },
    });
  },
};
