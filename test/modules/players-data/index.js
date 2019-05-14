const { of, from, interval, timer } = require('rxjs')
const { repeat, delay, map, takeUntil, mapTo } = require('rxjs/operators')

let distances
let turnovers

function initPlayersDistances(players) {
  distances = {}
  players.forEach(player => {
    distances[player] = 0
  })
}

function initTurnovers(players) {
  turnovers = {}
  players.forEach(player => {
    turnovers[player] = 0
  })
}

function getDistances(players) {
  if (!distances) {
    initPlayersDistances(players)
  }

  players.forEach(function(player) {
    distances[player] = distances[player] + Number(Math.random().toFixed(3))
  })

  return distances
}

function getTurnovers(players) {
  if (!turnovers) {
    initTurnovers(players)
  }

  players.forEach(function(player) {
    turnovers[player] =
      Math.random() > 0.4 ? turnovers[player] : turnovers[player] + 1
  })

  return turnovers
}

function samplePlayersEvery(timeIntervalForUpdate) {
  const players = [3, 8, 9, 11, 20]
  const gameTimer = timer(9 * 1000)
  return interval(timeIntervalForUpdate)
    .pipe(mapTo(players))
    .pipe(takeUntil(gameTimer))
}

function getPlayersDistances(players) {
  distances = getDistances(players)
  return { players, distances }
}

function getPlayersTurnovers({ players, distances }) {
  turnovers = getTurnovers(players)
  return { players, distances, turnovers }
}

module.exports = {
  samplePlayersEvery,
  getPlayersDistances,
  getPlayersTurnovers,
  calcScore: function(
    { distance: distanceWeight, turnovers: turnoversWeight },
    { players, distances, turnovers },
  ) {
    const wheightedScores = {}

    players.forEach(player => {
      wheightedScores[player] =
        distances[player] * distanceWeight + turnovers[player] * turnoversWeight
    })

    return wheightedScores
  },
  getWorstPlayer: function(scores) {
    // TODO return the worst player
    const worstPlayer = Object.entries(scores).reduce(
      (currentWorstPlayer, [playerNumber, currentScore]) => {
        const { score } = currentWorstPlayer

        if (score > currentScore) {
          return { playerNumber, score: currentScore }
        }

        return currentWorstPlayer
      },
      { score: 1000 },
    )

    return worstPlayer.playerNumber
  },
}
