import {Environment} from "../src/types";
import Strim from '../src/index'

describe('example', () => {

  const players = [3, 8, 9, 11, 20]
  const timeIntervalForUpdate = 1000

  fit('', done => {

   new Strim()
    .pipe({
      module: '../../test/modules/players-data',
      func: 'initGame',
      args: {players, timeIntervalForUpdate},
    })
    //.to(Environment.Server)
    // .pipe({
    //   module: 'players-data',
    //   func: 'getPlayerDistance',
    // })
    // .pipe({
    //   module: 'players-data',
    //   func: 'getPlayerTurnovers',
    // })
    // .to(Environment.Client)
    // .pipe({
    //   module: 'math',
    //   func: 'calcWeightedScore',
    //   args: {weights:{distance:0.3, turnovers:0.7}},
    // })
    // .pipe({
    //   module: 'players-data',
    //   func: 'getWorstPlayer',
    // })
    .subscribe({
      next: val => {
        console.log(val);
        expect(val).toBe(4)
      },
      error: err => {
        throw new Error(err)
      },
      complete: () => {
        console.log('complete');
        done()
      },
    })
  })
})
