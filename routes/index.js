const router = require('express').Router();
const { mongooseValidation } = require('./middlewares/errorHandlers');

const API_ROOT = '/api';
// router.use(API_ROOT + '/users', userRoutes);

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
