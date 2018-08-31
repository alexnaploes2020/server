const environment = process.env;
const appName = 'EYYIO';
const prodConfig = {
  mongoDbUri: environment[`${appName}_MONGODB_URI`],
  jwtSecret: environment[`${appName}_JWT_SECRET`],
};
const config =
  environment.NODE_ENV === 'production' ? prodConfig : require('./config-dev');

module.exports = config;
