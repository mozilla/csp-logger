module.exports = function (server, healthCheck) {
  server.extend(function (app) {
    app.get('/healthz', function (req, res) {
      var health = healthCheck ? healthCheck() : {
        'healthy': true,
        'response': {}
      };
      res.status(health.healthy ? 200 : 503).json(health.response || {});
    });
  });
};
