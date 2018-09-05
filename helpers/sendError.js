const parseErrors = require('./parseErrors');

module.exports = function sendError(res, statusCode, ...errorsArrays) {
  // default 400 status
  let responseStatus = Math.floor(Number(statusCode) || 400);
  if (![400, 401, 403, 404, 422].includes(responseStatus)) {
    responseStatus = 400;
  }
  res.status(responseStatus).json(parseErrors(...errorsArrays));
};
