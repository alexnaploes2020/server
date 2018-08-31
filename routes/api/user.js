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

module.exports = router;
