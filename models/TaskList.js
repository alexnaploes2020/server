const mongoose = require('mongoose');
const Joi = require('joi');
const slugify = require('../helpers/slugify');
const constants = require('../constants');

const { Schema } = mongoose;
const TaskListSchema = new Schema(
  {
    slug: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, 'TaskList name is required.'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'TaskList name is required.'],
    },
    type: {
      type: String,
      default: constants.GENERAL,
    },
    isComplete: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'TaskList owner is required.'],
      index: true,
    },
  },
  { timestamps: true },
);

TaskListSchema.statics.validateTaskListToSave = taskListToSave => {
  const schema = {
    name: Joi.string()
      .min(2)
      .max(100)
      .required(),
    type: Joi.string(),
    isComplete: Joi.boolean(),
  };
  return Joi.validate(taskListToSave, schema);
};

TaskListSchema.methods.toDtoJSON = function() {
  const taskList = this;
  const { name, type, isComplete, slug, owner } = taskList;
  const taskListJson = {
    name,
    type,
    isComplete,
    slug,
    owner: {
      email: owner.email,
      name: owner.name,
      id: owner.id,
    },
  };
  return taskListJson;
};

TaskListSchema.methods.slugify = function() {
  const taskList = this;
  taskList.slug = slugify(taskList.name);
};

TaskListSchema.pre('validate', function(next) {
  const taskList = this;
  taskList.slugify();
  next();
});

mongoose.model('TaskList', TaskListSchema);
