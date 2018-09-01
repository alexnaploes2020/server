const mongoose = require('mongoose');
const router = require('express').Router();
const sendJoiError = require('../../helpers/sendJoiError');
const sendError = require('../../helpers/sendError');

const User = mongoose.model('User');

// @route   POST: /api/users/
// @desc    Register a new user.
// @access  Public
router.post('/', async (req, res) => {
  const { error: joiError } = User.validateUserToSave(req.body);
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
    return sendError(res, 422, [
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

// @route   POST: /api/users/login
// @desc    Login a user and respond with a JWT
// @access  Public
router.post('/login', async (req, res) => {
  const { error: joiError } = User.validateUserToLogin(req.body);
  if (joiError) {
    return sendJoiError(res, joiError);
  }
  const { password, email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return sendError(res, 422, ['failToLogin', 'Invalid email or password']);
  }
  const isPasswordValid = await user.validatePassword(password);
  if (!isPasswordValid) {
    return sendError(res, 422, ['failToLogin', 'Invalid email or password']);
  }
  return res.json({ user: user.toAuthJSON() });
});

module.exports = router;
