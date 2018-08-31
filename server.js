require('express-async-errors');
const mongoose = require('mongoose');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('./logger');
const { mongoDbUri } = require('./config/config');
const errorHandlers = require('./routes/middlewares/errorHandlers');

// MongoDB Config
mongoose
  .connect(
    mongoDbUri,
    { useNewUrlParser: true },
  )
  .then(() => {
    const mode =
      process.env.NODE_ENV === 'production' ? 'production' : 'development';
    logger.info(`Successfully connected to MongoDB (${mode} database).`);
  })
  .catch(err => logger.error(err));

const app = express();
// Setup security middlewares
app.use(helmet());
app.use(cors());

// Setup express config
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Setup logger to also log unhandledRejection in async functions
process.on('unhandledRejection', ex => {
  // throw the exception for winston logger to catch
  throw ex;
});

// Setup models and route controllers
// TODO: load and setup models
app.use(require('./routes'));

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  logger.info('Serving client asset.');
  const clientPath = path.resolve(__dirname, 'client', 'build', 'index.html');
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(clientPath);
  });
}

// error handler
app.use(errorHandlers.global);

// Start the server
const port = process.env.PORT || 52000;
const server = app.listen(port, () => {
  logger.info(
    `Server is running on port ${port} in ${
      process.env.NODE_ENV === 'production' ? 'production' : 'development'
    };`,
  );
});

module.exports = server;
