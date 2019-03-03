import { IStrimModulesOptions } from '../types'
const express = require('express')
const expressWs = require('express-ws')
const path = require('path')
const fs = require('fs-extra')

const strimModules = {}

function getRouter(modulesPath: string) {
  const router = express.Router()
  const files = fs.readdirSync(modulesPath)
  // files.map(fs.statSync)
  files.forEach(moduleName => {
    strimModules[moduleName] = require(path.join(modulesPath, moduleName))
  })
  router.ws('/', (ws, req) => {
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
  app,
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
