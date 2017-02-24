module.exports = function (server, config, healthCheck) {
  if (config && config.health && config.health.enabled) {
    server.extend(function (app) {
      app.get(config.health.endpoint || '/healthz', function (req, res) {
        var health = healthCheck ? healthCheck(config) : {
          'healthy': true,
          'response': {}
        };
        res.status(health.healthy ? 200 : 503).json(health.response || {});
      });
    });
  }
};