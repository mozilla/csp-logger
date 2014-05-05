var server = require('./lib/server');
var store = require('./lib/store');

server.extend(function (app) {

  app.get('/', function (req, res) {
    res.header('Content-Security-Policy-Report-Only', 'default-src "self"; report-uri /csp;');
    res.status(200).sendfile('test/index.html');
  });

});

server.listen(2600, function (reportData, req) {
  store.save(reportData);
});
