const express = require('express')
const path = require('path')
const { strimModules } = require('../src/index')

describe('Strim Modules', () => {
  let app

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
