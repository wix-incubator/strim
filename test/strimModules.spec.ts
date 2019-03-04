import http from 'http'
import express from 'express'
import path from 'path'
import WebSocket from 'isomorphic-ws'
import { strimModules } from '../src/index'

const PORT = 4321

describe('Strim Modules', () => {
  let app: express.Application
  let server: http.Server

  beforeEach(() => {
    app = express()
    app = strimModules(app, {
      modulesPath: path.resolve('test/modules'),
    })
    server = app.listen(PORT)
  })
  afterEach(() => {
    server.close()
  })

  describe('setup', () => {
    it('should setup module directory and return the express app', () => {
      expect(app).toBeTruthy()
    })

    it('should throw error when module dir is not there', () => {
      app = express()
      expect(() => {
        strimModules(app, {
          modulesPath: path.resolve('test/nomodules'),
        })
      }).toThrowError('ENOENT: no such file or directory')
    })
  })

  describe('modules', () => {
    it('should return echo', done => {
      // start a ws to the server
      const ws = new WebSocket(`ws://localhost:${PORT}/`)
      // send it the correct message
      ws.onopen = function open() {
        // console.log('connected')
        ws.send(Date.now())
        done()
      }
      // expect return values
    })
  })
})
