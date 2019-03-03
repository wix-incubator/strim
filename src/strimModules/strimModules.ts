import {IStrimModulesOptions} from '../types';
const express = require('express');
const expressWs = require('express-ws');
const path = require('path');
const fs = require('fs-extra');

function getRouter(modulesPath: string) {
  const router = express.Router();
  const files = fs.readdirSync(modulesPath);
  // files.map(fs.statSync)
  // files.forEach()
  // router.ws('/', (ws, req) => {
  //   ws.on('message', function(msg) {
  //     ws.send(msg);
  //   });
  // });
  return router;
}

function strimModules(
  app,
  {wsRoute = '/strim', modulesPath = path.resolve('node_modules')}: IStrimModulesOptions = {}
) {
  expressWs(app);
  app.use(wsRoute, getRouter(modulesPath));
  return app;
}

export default strimModules;
