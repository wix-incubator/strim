const { of, from, interval, timer } = require('rxjs')
const { repeat, delay, map, takeUntil, mapTo } = require('rxjs/operators')

let distances
let turnovers

function initPlayersDistances(players){
  players.forEach(player => {
    distances[player] = 0
  })
}

function initTurnovers(players){
  players.forEach(player => {
    turnovers[player] = 0
  })
}

function getDistances(players){
  if (!distances) {
    initPlayersDistances(players);
  }

  players.forEach(function(player){
    distances[player] = distances[player] + Math.random().toFixed(3)
  })
}

function getTurnovers(players){
  if (!distances) {
    initTurnovers(players);
  }

  players.forEach(function(player){
    turnovers[player] = Math.random() > 0.4 ? turnovers[player] : turnovers[player] + 1
  })
}



function samplePlayersEvery(timeIntervalForUpdate) {
  const players = [3, 8, 9, 11, 20]
  const gameTimer = timer(90 * 1000)
  return interval(timeIntervalForUpdate).pipe(mapTo(players)).pipe(takeUntil(gameTimer))
}


function getPlayersDistances(players) {
  distances = getDistances(players)
  return {players, distances}
}

function getPlayersTurnovers({players, distances}) {
  turnovers = getTurnovers(players)
  return {players, distances, turnovers}
}



module.exports = {
  samplePlayersEvery,
  getPlayersDistances,
  getPlayersTurnovers,
  calcWeightedScore: function(args) {
    const players = args[0].players
    const turnovers = args[0].turnovers
    const distances = args[0].distances
    const weights = args[1].weights

    const wheightedScores = {}

    players.forEach(player => {
      wheightedScores[player] = distances[player] * weights.distance + turnovers[player] * weights.turnovers
    })

    return wheightedScores
  },
  getWorstPlayer: function(args) {
    const wheightedScores = args.wheightedScores

    // TODO return the worst player
    return players[0]
  }
}
