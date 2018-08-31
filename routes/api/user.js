const mongoose = require('mongoose');
const router = require('express').Router();
const sendJoiError = require('../../helpers/sendJoiError');
const send422Error = require('../../helpers/send422Error');

const User = mongoose.model('User');

// @route   POST: /api/users/
// @desc    Register a new user.
// @access  Public
router.post('/', async (req, res) => {
  const { error: joiError } = User.validateUser(req.body);
  if (joiError) {
    return sendJoiError(res, joiError);
  }
  const { password, email } = req.body;
  const pwComplexityError = User.validatePasswordComplexity(password).error;
  if (pwComplexityError) {
    return sendJoiError(res, pwComplexityError);
  }
  const emailExists = await User.validateUniqueEmail(email);
  if (emailExists) {
    return send422Error(res, [
      'email',
      'Account associates with this email already exists.',
    ]);
  }
  const userToRegister = new User({ ...req.body });
  userToRegister.setImage(email);
  await userToRegister.setPassword(password);
  await userToRegister.save();
  return res.json({ user: userToRegister.toAuthJSON() });
});

module.exports = router;
