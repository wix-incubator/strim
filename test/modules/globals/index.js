const { of, from } = require('rxjs')
const { filter, map, take, toArray } = require('rxjs/operators')

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

module.exports = {
  get1: function() {
    return of(1)
  },
  get: function(arr) {
    return from(arr)
  },
  increase: function(value) {
    return value + 1
  },
  filter: function() {
    return filter(x => x % 2 === 0)
  },
  random: function() {
    return getRandomInt(100)
  },
}
