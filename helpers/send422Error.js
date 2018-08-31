const parseErrors = require('./parseErrors');

module.exports = function send422Error(res, ...errorsArrays) {
  res.status(422).json(parseErrors(...errorsArrays));
};
