import express from 'express'
import path from 'path'
import { strimModules } from '../src/index'

describe('Strim Modules', () => {
  let app: express.Application

  beforeEach(() => {
    app = express()
  })

  describe('setup', () => {
    it('should do stuff', () => {
      const newApp = strimModules(app, {
        modulesPath: path.resolve('test/modules'),
      })
      expect(newApp).toBeTruthy()
    })
  })
})
