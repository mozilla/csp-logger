var config = require('./config');

var store;

switch (config.store) {
case 'sql':
  store = require('./stores/sql');
  break;
case 'logger':
  store = require('./stores/logger');
  break;
default:
  console.log('Defaulting to file logger');
  store = require('./stores/logger');
}

module.exports = store;
