const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const PasswordComplexity = require('joi-password-complexity');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
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
    // image url is managed by gravatar
    image: { type: String, required: [true, 'User image url is required.'] },
    bio: String,
    location: String,
  },
  { timestamps: true },
);

UserSchema.statics.validateUserToLogin = userToLogin => {
  const schema = {
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email({ minDomainAtoms: 2 }),
    password: Joi.string()
      .min(8)
      .max(255)
      .required(),
  };
  return Joi.validate(userToLogin, schema);
};

UserSchema.statics.validateUserToSave = userToSave => {
  const schema = {
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email({ minDomainAtoms: 2 }),
    password: Joi.string()
      .min(8)
      .max(255)
      .required(),
    name: Joi.string()
      .min(3)
      .max(50)
      .required(),
    bio: Joi.string(),
    location: Joi.string(),
  };
  return Joi.validate(userToSave, schema);
};

UserSchema.statics.validatePasswordComplexity = password => {
  const options = {
    min: 8,
    max: 255,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
  };
  return Joi.validate(password, new PasswordComplexity(options));
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

UserSchema.methods.setImage = function(email) {
  const userToUpdate = this;
  userToUpdate.image = gravatar.url(email, {
    s: '200',
    r: 'g',
    d: 'identicon',
  });
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
