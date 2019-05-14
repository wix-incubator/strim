import Strim from '../src/index'

jest.setTimeout(10000)

describe('example', () => {
  const timeIntervalForUpdate = 1000
  let index = 1

  it('', done => {
    new Strim()
      .pipe({
        module: './test/modules/players-data',
        func: 'samplePlayersEvery',
        args: timeIntervalForUpdate,
      })
      // .toServer()
      .pipe({
        module: './test/modules/players-data',
        func: 'getPlayersDistances',
      })
      .pipe({
        module: './test/modules/players-data',
        func: 'getPlayersTurnovers',
      })
      // .toClient()
      .pipe({
        module: './test/modules/players-data',
        func: 'calcScore',
        args: { distance: 0.3, turnovers: 0.7 },
      })
      .pipe({
        module: './test/modules/players-data',
        func: 'getWorstPlayer',
      })
      .subscribe({
        next: val => {
          console.log(val)
          // @ts-ignore
          expect(val).not.toBeNaN()
          index++
          if (index === 9) {
            done()
          }
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
