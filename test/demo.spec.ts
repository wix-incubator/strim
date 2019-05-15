import Strim from '../src/index'

jest.setTimeout(10000)

describe('example', () => {
  const timeIntervalForUpdate = 1000
  let index = 1

  it('should get worst player', done => {
    new Strim({ modulesDir: '../../test/modules' })
      .pipe({
        module: 'players-data',
        func: 'samplePlayersEvery',
        args: timeIntervalForUpdate,
      })
      // .toServer()
      .pipe({
        module: 'players-data',
        func: 'getPlayersDistances',
      })
      .pipe({
        module: 'players-data',
        func: 'getPlayersTurnovers',
      })
      // .toClient()
      .pipe({
        module: 'players-data',
        func: 'calcScore',
        args: { distance: 0.3, turnovers: 0.7 },
      })
      .pipe({
        module: 'players-data',
        func: 'getWorstPlayer',
      })
      .subscribe({
        next: val => {
          // @ts-ignore
          expect(val).not.toBeNaN()
          index++
        },
        error: err => {
          throw new Error(err)
        },
        complete: () => {
          if (index === 9) {
            done()
          }
        },
      })
  })
})
