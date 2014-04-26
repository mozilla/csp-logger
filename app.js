//var config = require('./lib/config');
var server = require('./lib/server');
var store = require('./lib/store');

server.listen(2600, function (reportData, req) {

  store.save(reportData);
});
