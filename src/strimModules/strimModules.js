const express = require('express')
const WebSocket = require('ws')
const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const { Subject, Observable, Subscriber, isObservable } = require('rxjs')
const hash = require('object-hash')
const utils = require('./utils')

let strimNodeModules

const {
  STRIM_CLIENT_BUNDLE_FILE_PATH,
  STRIM_WEBWORKER_BUNDLE_FILE_PATH,
  getClientConfig,
  ENVIRONMENT,
} = require('./webpack.config.client')

let strimClientBundlePromise
let strimWebworkerBundlePromise

function setHealthcheck(router) {
  router.get('/', (_, res) => {
    res.send('All Good')
  })
}

function getPackageJsonFile(modulePath) {
  const packageJsonPath = path.resolve(modulePath, 'package.json')
  if (fs.existsSync(packageJsonPath)) {
    const fileString = fs.readFileSync(packageJsonPath, 'utf8')
    return JSON.parse(fileString)
  }
  return null
}

function shouldBundleModuleToClient(packageJsonFile) {
  if (!packageJsonFile) {
    return false
  }
  const { environment } = packageJsonFile
  if (environment && environment.client === false) {
    return false
  }
  return true
}

function shouldBundleModuleToWebworker(packageJsonFile) {
  if (!packageJsonFile) {
    return false
  }
  const { environment } = packageJsonFile
  if (environment && environment.webwroker === true) {
    return true
  }
  return false
}

function getModulesEntriesToBundle(modulesPath, environment) {
  const files = fs.readdirSync(modulesPath)
  return files.reduce((entriesPath, fileName) => {
    const filePath = path.resolve(modulesPath, fileName)
    const packageJson = getPackageJsonFile(filePath)

    if (
      (environment === ENVIRONMENT.CLIENT &&
        shouldBundleModuleToClient(packageJson)) ||
      (environment === ENVIRONMENT.WEBWORKER &&
        shouldBundleModuleToWebworker(packageJson))
    ) {
      entriesPath.push({
        name: packageJson.name,
        entry: path.resolve(filePath, packageJson.main),
      })
    }

    return entriesPath
  }, [])
}

function createModulesEntriesFile(modulesEnrties, environment) {
  const requires = modulesEnrties.map(
    ({ name, entry }) => `"${name}": require('${entry}')`,
  )

  if (environment === ENVIRONMENT.CLIENT) {
    return `window.strimClientModules = { ${requires.join(',')}}`
  } else if (environment === ENVIRONMENT.WEBWORKER) {
    return `
self.strimClientModules = { ${requires.join(',')}}
self.addEventListener('message', (msg)=>{
  postMessage(msg)
})`
  }
}

function bundleModules(virtualEntriesfile, bundlesDir, environment) {
  return new Promise((resolve, reject) => {
    const compiler = webpack(
      getClientConfig(virtualEntriesfile, bundlesDir, environment),
    )
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

function createClientBundle(modulesPath, bundlesDir, environment) {
  const bundleEntries = getModulesEntriesToBundle(modulesPath, environment)

  const virtualEntriesfile = createModulesEntriesFile(
    bundleEntries,
    environment,
  )
  return bundleModules(virtualEntriesfile, bundlesDir, environment)
}

function setBundlesEndpoint(router, bundlesDir) {
  router.get('/strim.js', (_, res) => {
    strimClientBundlePromise.then(() => {
      res.sendFile(path.resolve(bundlesDir, STRIM_CLIENT_BUNDLE_FILE_PATH))
    })
  })

  router.get('/strim.webworker.js', (_, res) => {
    strimWebworkerBundlePromise.then(() => {
      res.sendFile(path.resolve(bundlesDir, STRIM_WEBWORKER_BUNDLE_FILE_PATH))
    })
  })
}

const strimMaps = new Map()

function setWs(ws) {
  ws.on('message', function(msg) {
    const data = JSON.parse(JSON.parse(msg))
    if (data.subscribe) {
      // console.log(data.subscribe)
      const subject = subjectifyStrim(data, ws)
      strimMaps.set(data.subscribe, { subject })
    } else if (data.unsubscribe) {
      const serverStrim = strimMaps.get(data.unsubscribe)
      serverStrim.subject.complete()
      serverStrim.subject.unsubscribe()
      strimMaps.delete(data.unsubscribe)
    } else if (data.pipeHash) {
      const serverStrim = strimMaps.get(data.pipeHash)
      serverStrim.subject.next(data.value)
    } else {
      console.error(data)
      ws.send(data)
    }
  })
}

function pipeableWrapper(scope, func, args) {
  return source =>
    new Observable(observer => {
      return source.subscribe({
        next(x) {
          const appliedArgs = args ? [args, x] : [x]
          const result = func.apply(scope, appliedArgs)

          if (isObservable(result)) {
            result.subscribe(observer)
          } else {
            observer.next(result)
          }
        },
        error(err) {
          observer.error(err)
        },
        complete() {
          observer.complete()
        },
      })
    })
}

function getPipeableFunc(execFuncData) {
  const { module, func, args } = execFuncData
  const src = strimNodeModules[module]
  return pipeableWrapper(src, src[func], args)
}

function subjectifyStrim({ subscribe, pipeItems }, ws) {
  const subject = new Subject()
  const observable = pipeItems.reduce((accStrim, strimFunc) => {
    return accStrim.pipe(getPipeableFunc(strimFunc))
  }, subject)

  observable.subscribe(
    value => {
      ws.send(JSON.stringify({ value, type: subscribe }))
    },
    err => {
      ws.send(JSON.stringify({ err, type: subscribe }))
    },
    () => {
      ws.send(JSON.stringify({ unsubscribe: subscribe }))
    },
  )
  return subject
}

function getConfituredRouter(modulesPath, bundlesDir) {
  const router = express.Router()
  setHealthcheck(router)
  strimNodeModules = utils.getNodeStrimModules(modulesPath)
  // const strimWorker = utils.getNodeStrimWorker(modulesPath)

  strimClientBundlePromise = createClientBundle(
    modulesPath,
    bundlesDir,
    ENVIRONMENT.CLIENT,
  ).then(() => {
    if (!global.jest) {
      console.log('strim client bundle compiled successfully')
    }
  }, console.error)

  strimWebworkerBundlePromise = createClientBundle(
    modulesPath,
    bundlesDir,
    ENVIRONMENT.WEBWORKER,
  ).then(() => {
    if (!global.jest) {
      console.log('strim webworker bundle compiled successfully')
    }
  }, console.error)

  setBundlesEndpoint(router, bundlesDir)
  return router
}

module.exports = {
  setWs: function(server) {
    const wss = new WebSocket.Server({ server })
    wss.on('connection', setWs)
  },
  setStrimModules: function(
    app,
    {
      wsRoute = '/strim',
      modulesPath = path.resolve('node_modules'),
      bundlesDir = path.resolve(modulesPath, 'bundles'),
    } = {},
  ) {
    // process.env.strimModulesPath = modulesPath
    app.use(wsRoute, getConfituredRouter(modulesPath, bundlesDir))
    return app
  },
}
