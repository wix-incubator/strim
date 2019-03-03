import {IStrimModulesOptions} from '../types';
const express = require('express');
const expressWs = require('express-ws');
const path = require('path');

function getRouter() {
  const router = express.Router();
  return router;
}

function strimModules(
  app,
  {wsRoute = '/strim', modulesPath = path.resolve('node_modules')}: IStrimModulesOptions = {}
) {
  expressWs(app);
  app.use(wsRoute, getRouter());
  return app;
}

export default strimModules;
