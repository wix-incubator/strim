import { IStrimModulesOptions, IRouterWithWebSockets } from '../types'
import express from 'express'
import expressWs from 'express-ws'
import path from 'path'
import fs from 'fs-extra'

const strimModules = {}

function getRouter(modulesPath: string) {
  const router = express.Router() as IRouterWithWebSockets
  const files = fs.readdirSync(modulesPath)
  // files.map(fs.statSync)
  files.forEach((moduleName: string) => {
    strimModules[moduleName] = require(path.join(modulesPath, moduleName))
  })
  router.get('/strim', (_, res) => {
    res.send('All Good')
  })
  router.ws('/', (ws, _) => {
    ws.on('message', function(msg) {
      console.log(msg)
      // {module, func, args}
      // const res = strimModules[module][func].apply(strimModules[module], args)
      // ws.send(res);
      ws.send(msg)
    })
  })
  return router
}

function setStrimModules(
  app: express.Application,
  {
    wsRoute = '/strim',
    modulesPath = path.resolve('node_modules'),
  }: IStrimModulesOptions = {},
) {
  expressWs(app)
  app.use(wsRoute, getRouter(modulesPath))
  return app
}

export default setStrimModules
