import { IStrimModulesOptions, IRouterWithWebSockets } from '../types'
import express from 'express'
import expressWs from 'express-ws'
import path from 'path'
import fs from 'fs'

const strimModules = {}

function setHealthcheck(router: express.Router) {
  router.get('/', (_, res: express.Response) => {
    res.send('All Good')
  })
}

function setModulesWs(router: IRouterWithWebSockets, modulesPath: string) {
  const files = fs.readdirSync(modulesPath)
  files.forEach((moduleName: string) => {
    strimModules[moduleName] = require(path.join(modulesPath, moduleName))
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
}

function getConfituredRouter(modulesPath: string) {
  const router = express.Router() as IRouterWithWebSockets
  setHealthcheck(router)
  setModulesWs(router, modulesPath)

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
  app.use(wsRoute, getConfituredRouter(modulesPath))
  return app
}

export default setStrimModules
