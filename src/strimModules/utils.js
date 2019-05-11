const fs = require('fs')
const path = require('path')
const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require('worker_threads')

const strimModules = {}

function shouldRequireModule(modulePath) {
  return !modulePath.endsWith('bundles')
}
function shouldRequireWorkerModule(modulePath) {
  return shouldRequireModule(modulePath)
}

function getNodeStrimModules(modulesPath) {
  const files = fs.readdirSync(modulesPath)
  files.forEach(moduleName => {
    const modulePath = path.join(process.cwd(), modulesPath, moduleName)
    if (
      (isMainThread && shouldRequireModule(modulePath)) ||
      (!isMainThread && shouldRequireWorkerModule(modulePath))
    ) {
      strimModules[moduleName] = require(modulePath)
    }
  })

  return strimModules
}

function getNodeStrimWorker(modulesPath) {
  const worker = new Worker(path.resolve(__dirname, './strimWorker.js'), {
    workerData: modulesPath,
  })
  // TODO: remove
  worker.on('error', console.error)
  return worker
}

module.exports = {
  getNodeStrimModules,
  getNodeStrimWorker,
}
