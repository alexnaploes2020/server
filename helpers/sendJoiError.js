const parseErrors = require('./parseErrors');

module.exports = function sendJoiError(res, joiError) {
  const {
    context: { key },
    message,
  } = joiError.details[0];
  const error = key || 'error';
  res.status(422).json(parseErrors([error, message]));
};
