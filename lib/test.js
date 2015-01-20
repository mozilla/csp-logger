var filename = require.resolve('../test/index.html');
module.exports = function (server) {
  server.extend(function (app) {
    app.get('/', function (req, res) {
      res.header('Content-Security-Policy-Report-Only', 'default-src "self"; report-uri /csp;');
      res.status(200).sendfile(filename);
    });

  });

};
