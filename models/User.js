const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');
const parseErrors = require('../helpers/parseErrors');

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
    bio: Joi.string(),
    location: Joi.string(),
  };
  return Joi.validate(userToSave, schema);
};

UserSchema.statics.validateUniqueEmail = function(email, res) {
  const User = this;
  User.findOne({ email })
    .then(user =>
      res
        .status(422)
        .json(
          parseErrors([
            'email',
            'Account associates with this email already exists.',
          ]),
        ),
    )
    .catch(err => {
      throw err;
    });
};

mongoose.model('User', UserSchema);
