var config = require('./lib/config');
var server = require('./lib/server');
var store = require('./lib/store');

server.listen(config.port || 2600, function (reportObject, req) {

  store.save(reportObject);
});
