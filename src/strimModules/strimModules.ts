import {IStrimModulesOptions} from '../types';
import express from 'express';
import expressWs from 'express-ws';

function getRouter() {
  const router = express.Router();
  return router;
}

function strimModules(app, {wsRoute = '/strim'}: IStrimModulesOptions) {
  expressWs(app);
  app.use(wsRoute, getRouter());
  return app;
}

export default strimModules;
