import Strim from '../src/index'
describe('example', () => {
  const timeIntervalForUpdate = 1000

  it('', done => {
    new Strim()
      .pipe({
        module: '../../test/modules/globals',
        func: 'random',
      })
      .pipe({
        module: '../../test/modules/globals',
        func: 'increase',
      })
      .subscribe({
        next: val => {
          expect(val).toBe(4)
        },
        error: err => {
          throw new Error(err)
        },
        complete: () => {
          console.log('complete')
          done()
        },
      })
  })
})
