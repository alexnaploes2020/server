const mongoose = require('mongoose');
const router = require('express').Router();
const auth = require('../middlewares/auth');
const sendJoiError = require('../../helpers/sendJoiError');
const sendError = require('../../helpers/sendError');
const constants = require('../../constants');

const TaskList = mongoose.model('TaskList');
const taskListsTypes = [constants.GENERAL, constants.PROJECT];

// @route   POST: /api/task-lists/
// @desc    Create a new taskLists for a user
// @access  Private
router.post('/', auth, async (req, res) => {
  const { error: joiError } = TaskList.validateTaskListToSave(req.body);
  if (joiError) {
    return sendJoiError(res, joiError);
  }
  const { type } = req.body;
  if (type && !taskListsTypes.includes(type)) {
    return sendError(res, [
      'type',
      'TaskList type can only be "General" or "Project"',
    ]);
  }
  let { user } = req;
  let taskListToCreate = new TaskList(req.body);
  taskListToCreate.owner = user;
  user.taskLists.push(taskListToCreate);
  const result = await Promise.all([taskListToCreate.save(), user.save()]);
  [taskListToCreate, user] = result;
  return res.json({ taskList: taskListToCreate.toDtoJSON() });
});

// @route   GET: /api/task-lists/
// @desc    Fetch all taskLists for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  const { user } = req;
  let taskLists = await TaskList.find({ owner: user })
    .populate('owner')
    .sort({ type: 1, updatedAt: -1 });
  taskLists = taskLists.map(tl => tl.toDtoJSON());
  return res.json({ taskLists });
});

// @route   GET: /api/task-lists/:slug
// @desc    Fetch a taskList by slug
// @access  Private
router.get('/:slug', auth, async (req, res) => {
  const { user } = req;
  const { slug } = req.params;
  const taskList = await TaskList.findOne({ slug });
  if (!taskList) {
    return sendError(res, 404, ['taskList', 'TaskList not found.']);
  }
  if (taskList.owner._id.toString() !== user._id.toString()) {
    return sendError(res, 403, [
      'taskList',
      `User is not the taskList's owner`,
    ]);
  }
  return res.json({ taskList });
});

module.exports = router;
