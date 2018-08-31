const cors = require('cors');
const helmet = require('helmet');
const express = require('express');

const app = express();
// Setup security middlewares
app.use(helmet());
app.use(cors());
