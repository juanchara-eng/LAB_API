const serverless = require('serverless-http');
const app = require('../laboratorio-universidad/app');

module.exports = serverless(app);
