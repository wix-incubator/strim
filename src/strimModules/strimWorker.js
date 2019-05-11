const { isMainThread, parentPort, workerData } = require('worker_threads')

const utils = require('./utils')
const strimModules = utils.getNodeStrimModules(workerData)

parentPort.on('message', msg => {
  parentPort.postMessage(msg)
})
