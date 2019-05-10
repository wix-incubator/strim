import http from 'http'
import express from 'express'
import WebSocket from 'isomorphic-ws'
import axios from 'axios'
import adapter from 'axios/lib/adapters/http'
import { setStrimModules, setWs } from '../src/index'

const PORT = 4321

describe('Strim Modules', () => {
  let app: express.Application
  let server: http.Server

  beforeEach(done => {
    app = express()
    app = setStrimModules(app, {
      modulesPath: 'test/modules',
    })
    server = app.listen(PORT, () => {
      done()
    })
    setWs(server)
  })
  afterEach(() => {
    server.close()
  })

  describe('setup', () => {
    it('should setup module directory and return the express app', done => {
      expect(app).toBeTruthy()
      axios
        .get(`http://localhost:${PORT}/strim/strim.js`, { adapter })
        .then(res => {
          expect(res).toBeTruthy()
          done()
        })
        .catch(done)
    }, 10000)

    it('should have webworker bundle', done => {
      axios
        .get(`http://localhost:${PORT}/strim/strim.webworker.js`, { adapter })
        .then(res => {
          expect(res).toBeTruthy()
          done()
        })
        .catch(done)
    }, 10000)

    it('should throw error when module dir is not there', () => {
      app = express()
      expect(() => {
        setStrimModules(app, {
          modulesPath: 'test/nomodules',
          bundlesDir: 'test/nomodules/bundles',
        })
      }).toThrowError('ENOENT: no such file or directory')
    })
  })

  describe('modules', () => {
    it('should return echo from websocket', done => {
      // start a ws to the server
      const ws = new WebSocket(`ws://localhost:${PORT}/`)
      // send it the correct message
      const clientData = Date.now()
      ws.onopen = () => {
        ws.send(JSON.stringify(clientData))
      }

      ws.onclose = () => {
        done(new Error('WebSocket Disconnected'))
      }

      ws.onmessage = (res: any) => {
        const data = JSON.parse(res.data)
        // console.log(`Roundtrip time: ${Date.now() - res.data} ms`)
        // expect return values
        expect(data).toBe(clientData)
        done()
      }
    })
  })
})
