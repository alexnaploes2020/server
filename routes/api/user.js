const mongoose = require('mongoose');
const router = require('express').Router();
const auth = require('../middlewares/auth');
const sendJoiError = require('../../helpers/sendJoiError');
const send422Error = require('../../helpers/send422Error');

const User = mongoose.model('User');

// @route   GET: /api/user/
// @desc    Get a user with a JWT
// @access  Private
router.get('/', auth, async (req, res) => {
  const { user } = req;
  return res.json({ user: user.toAuthJSON() });
});

const getPreSaveUpdatedUser = (userInDb, fieldsToUpdate) => {
  const currentRequiredFields = {
    email: userInDb.email,
    password: userInDb.password,
    name: userInDb.name,
  };
  const preSaveUpdatedUser = {
    ...currentRequiredFields,
    ...fieldsToUpdate,
  };
  return preSaveUpdatedUser;
};

// @route   PUT: /api/user
// @desc    Update a user profile
// @access  Private
router.put('/', auth, async (req, res) => {
  const { user: userInDb } = req;
  const preSaveUpdatedUser = getPreSaveUpdatedUser(userInDb, req.body);
  const { error: joiError } = User.validateUserToSave(preSaveUpdatedUser);
  if (joiError) {
    return sendJoiError(res, joiError);
  }
  const { email, password } = req.body;
  if (
    email &&
    email !== userInDb.email &&
    (await User.validateUniqueEmail(email))
  ) {
    return send422Error(res, [
      'email',
      'Account associates with this email already exists.',
    ]);
  }
  userInDb.set(preSaveUpdatedUser);
  if (password) {
    await userInDb.setPassword(password);
  }
  userInDb.setImage(preSaveUpdatedUser.email);
  const updatedUser = await userInDb.save();
  return res.json({ user: updatedUser.toAuthJSON() });
});

// @route   DELETE: /api/user/
// @desc    Delete a user
// @access  Private
router.delete('/', auth, async (req, res) => {
  const { user } = req;
  await user.remove();
  return res.sendStatus(204);
});

module.exports = router;
