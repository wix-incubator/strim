const express = require('express')
const expressWs = require('express-ws')
const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const hash = require('object-hash')

const {
  STRIM_CLIENT_BUNDLE_FILE_PATH,
  getClientConfig,
} = require('./webpack.config.client')

const strimModules = {}
let strimClientBundlePromise

function setHealthcheck(router) {
  router.get('/', (_, res) => {
    res.send('All Good')
  })
}

function getPackageJsonFile(modulePath) {
  const fileString = fs.readFileSync(
    path.resolve(modulePath, 'package.json'),
    'utf8',
  )
  return JSON.parse(fileString)
}

function shouldBundleModule(packageJsonFile) {
  const { environment } = packageJsonFile
  if (environment && environment.client === false) {
    return false
  }
  return true
}

function getModulesEntriesToBundle(modulesPath) {
  const files = fs.readdirSync(modulesPath)
  return files.reduce((entriesPath, fileName) => {
    const filePath = path.resolve(modulesPath, fileName)
    const packageJson = getPackageJsonFile(filePath)

    if (shouldBundleModule(packageJson)) {
      entriesPath.push({
        name: packageJson.name,
        entry: path.resolve(filePath, packageJson.main),
      })
    }

    return entriesPath
  }, [])
}

function createModulesEntriesFile(modulesEnrties) {
  const requires = modulesEnrties.map(
    ({ name, entry }) => `${name}: require('${entry}')`,
  )
  return `window.strimClientModules = { ${requires.join(',')}}`
}

function bundleModules(virtualEntriesfile) {
  return new Promise((resolve, reject) => {
    const compiler = webpack(getClientConfig(virtualEntriesfile))
    compiler.run((err, stats) => {
      if (err) {
        reject(err)
      }
      if (stats.hasErrors()) {
        const stat = stats.toJson()
        reject(stat.errors)
      }
      if (stats.hasWarnings()) {
        const stat = stats.toJson()
        console.warn(stat.warnings)
      }
      resolve(stats)
    })
  })
}

function createClientBundle(modulesPath) {
  const bundleEntries = getModulesEntriesToBundle(modulesPath)

  const virtualEntriesfile = createModulesEntriesFile(bundleEntries)
  return bundleModules(virtualEntriesfile)
}

function setBundleEndpoint(router) {
  router.get('/strim.js', (_, res) => {
    strimClientBundlePromise.then(() => {
      res.sendFile(
        path.resolve(
          process.cwd(),
          'dist/client',
          STRIM_CLIENT_BUNDLE_FILE_PATH,
        ),
      )
    })
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

const strimMaps = new Map()
function setWs(router) {
  router.ws('/ws', (ws, _) => {
    ws.on('message', function(msg) {
      const strimFuncs = JSON.parse(msg)
      if (!strimFuncs.type) {
        strimMaps.set(hash(strimFuncs), strimFuncs)
        // const strim = strimFuncs.reduce((accStrim, strimFunc) => {
        //   accStrim.pipe(strimFunc)
        // },new Strim())
        // strim.subscribe((val)=>{
        //   ws.send(val)
        // },(err)=>{
        //   ws.send({err})
        // },()=>{
        //   ws.send(JSON.stringify({unsubscribe:'unsubscribe'}))
        // })
      } else {
        console.log(strimFuncs.type);
      }


      // {module, func, args}
      // const res = strimModules[module][func].apply(strimModules[module], args)
      // ws.send(res);
      // ws.send(msg)
    })
  })
}

function getConfituredRouter(modulesPath) {
  const router = express.Router()
  setHealthcheck(router)
  importModules(modulesPath)
  setWs(router)

  strimClientBundlePromise = createClientBundle(modulesPath).catch(console.error)
  setBundleEndpoint(router)
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
