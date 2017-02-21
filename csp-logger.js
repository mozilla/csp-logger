#!/usr/bin/env node

var argv = require('optimist')
  .usage('Usage: $0 --config [file path]')
  .demand('c')
  .alias('c', 'config')
  .describe('c', 'Path to configuration file')
  .describe('test', 'Enables testing mode')
  .describe('example', 'Writes example config to given file instead of reading it and exits')
  .demand(['c'])
  .argv;

if (argv.example) {
  var config = require('./lib/config').dropExample(argv.c);
} else {
  var config = require('./lib/config').load(argv.c);

  var server = require('./lib/server').init(config);

  if (argv.test) {
    console.log('Testing page enabled');
    require('./lib/test')(server);
  }

  var store = require('./lib/store').init(config);

  require('./lib/healthz')(server);

  server.listen(config.port || 2600, function (reportObject, req) {
    store.save(reportObject);
  });
}
