import Strim from '../src/index'
describe('example', () => {
  const timeIntervalForUpdate = 1000

  it('should generate random number', done => {
    let msg = 'Random number never received'
    new Strim({ modulesDir: '../../test/modules' })
      .pipe({
        module: 'globals',
        func: 'random',
      })
      .pipe({
        module: 'globals',
        func: 'increase',
      })
      .subscribe({
        next: val => {
          expect(val).not.toBeNaN()
          msg = undefined
        },
        error: err => {
          throw new Error(err)
        },
        complete: () => {
          console.log('complete')
          done(msg)
        },
      })
  })
})
