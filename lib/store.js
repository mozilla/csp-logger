module.exports = {
  init: function (config) {
    var store;

    switch (config.store) {
    case 'sql':
      store = require('./stores/sql')(config);
      break;
    case 'logger':
      store = require('./stores/logger')(config);
      break;
    case 'console':
      store = require('./stores/console')(config);
      break;
    case 'disabled':
      store = require('./stores/nil')(config);
      break;
    default:
      console.log('Defaulting to console logger');
      store = require('./stores/console')(config);
    }

    return store;

  }
};