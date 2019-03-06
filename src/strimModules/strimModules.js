const express = require('express')
const expressWs = require('express-ws')
const path = require('path')
const fs = require('fs')

const strimModules = {}

function setHealthcheck(router) {
  router.get('/', (_, res) => {
    res.send('All Good')
  })
}

function importModules(modulesPath) {
  const files = fs.readdirSync(modulesPath)
  files.forEach(moduleName => {
    strimModules[moduleName] = require(path.join(
      process.cwd(),
      modulesPath,
      moduleName,
    ))
  })
}

function setWs(router) {
  router.ws('/', (ws, _) => {
    ws.on('message', function(msg) {
      // {module, func, args}
      // const res = strimModules[module][func].apply(strimModules[module], args)
      // ws.send(res);
      ws.send(msg)
    })
  })
}

function getConfituredRouter(modulesPath) {
  const router = express.Router()
  setHealthcheck(router)
  importModules(modulesPath)
  setWs(router)

  return router
}

module.exports = {
  setStrimModules: function(
    app,
    { wsRoute = '/strim', modulesPath = path.resolve('node_modules') } = {},
  ) {
    expressWs(app)
    app.use(wsRoute, getConfituredRouter(modulesPath))
    return app
  },
}
