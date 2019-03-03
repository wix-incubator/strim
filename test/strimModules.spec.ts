const express = require('express');
const {strimModules} = require('../src/index');

describe('Strim Modules', () => {
  let app;

  beforeEach(() => {
    app = express();
  });

  describe('setup', () => {
    it('should do stuff', () => {
      strimModules(app);
      expect(app).toBeTruthy();
    });
  });
});
