const router = require('express').Router();
const usersRoutes = require('./api/users');
const userRoutes = require('./api/user');
const taskListsRoutes = require('./api/taskLists');
const { mongooseValidation } = require('./middlewares/errorHandlers');

const API_ROOT = '/api';
router.use(`${API_ROOT}/users`, usersRoutes);
router.use(`${API_ROOT}/user`, userRoutes);
router.use(`${API_ROOT}/task-lists`, taskListsRoutes);

// not found route middleware
router.use((req, res, next) => {
  res.status(404).send({
    errors: {
      error: 'notFound',
      message: 'Source Not Found.',
    },
  });
});

// mongoose validation error handler
router.use(mongooseValidation);

module.exports = router;
