import express from 'express'
import path from 'path'
import { setStrimModules } from '../src/index'

const PORT = 4321

const app = express()
setStrimModules(app, {
  modulesPath: path.resolve('test/modules'),
})
app.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}`)
})
