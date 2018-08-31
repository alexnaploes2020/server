const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

const { Schema } = mongoose;
const UserSchema = new Schema(
  {
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, 'Email is required.'],
      match: [/\S+@\S+\.\S+/, 'Email format is invalid.'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
    },
    name: {
      type: String,
      required: [true, 'Name is required.'],
    },
    image: {
      type: String,
    },
    bio: {
      type: String,
    },
    location: {
      type: String,
    },
  },
  { timestamps: true },
);

UserSchema.statics.validateUser = userToSave => {
  const schema = {
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    password: Joi.string()
      .min(8)
      .max(255)
      .required(),
    name: Joi.string()
      .min(3)
      .max(50)
      .required(),
    image: Joi.string(),
    bio: Joi.string(),
    location: Joi.string(),
  };
  return Joi.validate(userToSave, schema);
};

UserSchema.statics.validateUniqueEmail = async function(email) {
  const User = this;
  const user = await User.findOne({ email });
  return !!user;
};

UserSchema.methods.setPassword = async function(password) {
  const userToSave = this;
  const salt = await bcrypt.genSalt(10);
  userToSave.password = await bcrypt.hash(password, salt);
};

UserSchema.methods.validatePassword = async function(password) {
  const userToLogin = this;
  const isValid = await bcrypt.compare(password, userToLogin.password);
  return isValid;
};

UserSchema.methods.generateJWT = function() {
  const user = this;
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
    },
    jwtSecret,
  );
  return token;
};

UserSchema.methods.toAuthJSON = function() {
  const user = this;
  const authJson = {
    token: user.generateJWT(),
    email: user.email,
    name: user.name,
    image: user.image,
    bio: user.bio,
    location: user.location,
  };
  return authJson;
};

UserSchema.methods.generateJWT = mongoose.model('User', UserSchema);
