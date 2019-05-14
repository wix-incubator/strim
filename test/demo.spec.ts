import Strim from '../src/index'

describe('example', () => {
  const timeIntervalForUpdate = 1000

  it('', done => {
    new Strim()
      .pipe({
        module: './test/modules/players-data',
        func: 'samplePlayersEvery',
        args: timeIntervalForUpdate,
      })
      .toServer()
      .pipe({
        module: './test/modules/players-data',
        func: 'getPlayersDistance',
      })
      .pipe({
        module: './test/modules/players-data',
        func: 'getPlayersTurnovers',
      })
      .toClient()
      .pipe({
        module: './test/modules/math',
        func: 'calcScore',
        args: {weights:{distance:0.3, turnovers:0.7}},
      })
      .pipe({
        module: './test/modules/players-data',
        func: 'getWorstPlayer',
      })
      .subscribe({
        next: val => {
          console.log(val)
          expect(val).toBe(4)
          done()
        },
        error: err => {
          throw new Error(err)
        },
        complete: () => {
          console.log('complete')
        },
      })
  })
})
