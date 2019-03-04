import Strim from '../src/index'

describe('Strim', () => {
  let strim: Strim

  beforeEach(() => {
    strim = new Strim()
  })

  describe('single pipe flow', () => {
    it('should create a new count property', done => {
      let index = 0
      const arr = [1, 2, 3, 4]
      strim
        .pipe({
          module: '../../test/modules/globals',
          func: 'get',
          args: [arr],
        })
        .subscribe({
          next: val => {
            expect(val).toBe(arr[index])
            index++
          },
          error: err => {
            throw new Error(err)
          },
          complete: () => {
            done()
          },
        })
    })
  })
  // describe('client 2 client', () => {});
  // describe('server 2 server', () => {});
  // describe('client 2 server', () => {});
})
