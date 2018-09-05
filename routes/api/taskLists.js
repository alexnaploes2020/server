const mongoose = require('mongoose');
const router = require('express').Router();
const auth = require('../middlewares/auth');
const sendJoiError = require('../../helpers/sendJoiError');
const sendError = require('../../helpers/sendError');
const constants = require('../../constants');

const { GENERAL, PROJECT } = constants;
const TaskList = mongoose.model('TaskList');
const taskListsTypes = [GENERAL, PROJECT];

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
    return sendError(res, 422, [
      'taskListType',
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
  const taskList = await TaskList.findOne({ slug }).populate('owner');
  if (!taskList) {
    return sendError(res, 404, ['taskList', 'TaskList not found.']);
  }
  if (taskList.owner._id.toString() !== user._id.toString()) {
    return sendError(res, 403, [
      'taskList',
      `User is not the taskList's owner`,
    ]);
  }
  return res.json({ taskList: taskList.toDtoJSON() });
});

const getPreSaveUpdatedTaskList = (taskListInDb, fieldsToUpdate) => {
  const currentRequiredFields = {
    name: taskListInDb.name,
  };
  const preSaveUpdatedTaskList = {
    ...currentRequiredFields,
    ...fieldsToUpdate,
  };
  return preSaveUpdatedTaskList;
};

// @route   PUT: /api/task-lists/:slug
// @desc    Update a taskList by slug
// @access  Private
router.put('/:slug', auth, async (req, res) => {
  const { user } = req;
  const { slug } = req.params;
  const taskList = await TaskList.findOne({ slug }).populate('owner');
  if (!taskList) {
    return sendError(res, 404, ['taskList', 'TaskList not found.']);
  }
  if (taskList.owner._id.toString() !== user._id.toString()) {
    return sendError(res, 403, [
      'taskList',
      `User is not the taskList's owner`,
    ]);
  }
  const { type, isComplete } = req.body;
  if (type && !taskListsTypes.includes(type)) {
    return sendError(res, 422, [
      'taskListType',
      'TaskList type can only be "General" or "Project"',
    ]);
  }
  // user wants to update isComplete and only project type can update isComplete
  if (
    typeof isComplete !== 'undefined' &&
    (taskList.type !== PROJECT && type !== PROJECT)
  ) {
    return sendError(res, 422, [
      'taskList',
      'Only taskList that is Project type can update isComplete field.',
    ]);
  }
  const preSaveUpdatedTaskList = getPreSaveUpdatedTaskList(taskList, req.body);
  const { error: joiError } = TaskList.validateTaskListToSave(
    preSaveUpdatedTaskList,
  );
  if (joiError) {
    return sendJoiError(res, joiError);
  }
  taskList.set(preSaveUpdatedTaskList);
  const updatedTaskList = await taskList.save();
  return res.json({ taskList: updatedTaskList.toDtoJSON() });
});

module.exports = router;
