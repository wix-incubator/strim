const { of, from, interval, timer } = require('rxjs')
const { repeat, delay, map, takeUntil, mapTo } = require('rxjs/operators')

module.exports = {
  initGame: function(args) {
    // const timeIntervalForUpdate = args.timeIntervalForUpdate
    // const players = args.players
    const gameTimer = timer(1000)
    //.pipe(mapTo([3,5]))
    return interval(100).pipe(takeUntil(gameTimer))
  },
  getPlayerDistance: function(player) {
    return player.pipe(map(player => 2))
  },
}
