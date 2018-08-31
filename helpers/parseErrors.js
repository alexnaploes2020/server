module.exports = function parseErrors(...errorsArrays) {
  const errorsToSend = {
    errors: {},
  };
  errorsArrays.forEach(errorPair => {
    if (!Array.isArray(errorPair) && errorPair.length !== 2) {
      throw Error('Argument errorPair is not a valid error pair array.');
    }
    const [key, message] = errorPair;
    errorsToSend.errors[key] = message;
  });
  return errorsToSend;
};
