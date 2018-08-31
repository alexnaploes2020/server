const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/config');
const parseErrors = require('../../helpers/parseErrors');

const User = mongoose.model('User');

function getTokenFromHeader(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
    return authHeader.split.split(' ')[1];
  }
  return null;
}

function verifyToken(token) {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    return null;
  }
}

function respond401(res) {
  res
    .status(401)
    .json(parseErrors(['unauthorized', 'Access denied, invalid token.']));
}

module.exports = (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) {
    return respond401(res);
  }
  // get the decoded payload (auth user json) from JWT
  const user = verifyToken(token);
  if (!user) {
    return respond401(res);
  }
  return User.findById(user.id)
    .then(foundUser => {
      if (!foundUser) {
        return respond401(res);
      }
      req.user = foundUser;
      return next();
    })
    .catch(err => {
      throw err;
    });
};
