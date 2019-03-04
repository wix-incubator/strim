const {of, from} = require('rxjs');
module.exports = {
  get1: function(){
    return of(1);
  },

  get: function(arr){
    return from(arr)
  }
};
