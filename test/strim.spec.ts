import Strim from '../src/index'

describe('Strim', () => {
  let strim: Strim

  beforeEach(() => {
    strim = new Strim({ modulesDir: '../../test/modules' })
  })

  describe('pipe flow with worker', () => {
    it('should create a new count property', done => {
      let index = 0
      const arr = [1, 2, 3, 4]
      strim
        .pipe({
          module: 'globals',
          func: 'get',
          args: arr,
        })
        .toServer(true)
        .pipe({
          module: 'globals',
          func: 'increase',
        })
        .subscribe({
          next: val => {
            expect(val).toBe(arr[index] + 1)
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

  describe('multiple pipe flow', () => {
    it('should create a new count property', done => {
      let index = 0
      const arr = [1, 2, 3, 4]
      const result = [3, 5]
      strim
        .pipe({
          module: 'globals',
          func: 'get',
          args: arr,
        })
        .pipe({
          module: 'globals',
          func: 'filter',
        })
        .pipe({
          module: 'globals',
          func: 'increase',
        })
        .subscribe({
          next: val => {
            expect(val).toBe(result[index])
            index++
          },
          error: err => {
            throw new Error(err)
          },
          complete: () => {
            expect(index).toBe(2)
            done()
          },
        })
    })
  })
})
