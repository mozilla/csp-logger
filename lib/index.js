var Report = require('./report');

module.exports = function (conf, existingServerToUse, testing) {
  var config;
  var handler;

  var healthCheck = function () {
    return {
      'healthy': true,
      'response': {}
    };
  };

  if (typeof conf === 'string') {
    config = require('./config').load(conf);
  } else {
    config = require('./config').set(conf);
  }

  var server = require('./server').init(config);
  if (testing) {
    console.log('Testing page enabled');
    require('./test')(server);
  }
  var store = require('./store').init(config);

  require('./healthz')(server, config, function () {
    return healthCheck();
  });

  server.listen(existingServerToUse || config.port || 2600, function (reportObject, req) {
    if (handler) {
      var reportExtended = handler(reportObject, req);
      if (reportExtended) {
        reportObject = reportExtended;
      }
    }

    store.save(reportObject);
  });

  return {
    Report: Report,
    interceptReport: function (callback) {
      handler = callback;
    },
    healthCheck: function (callback) {
      healthCheck = callback;
    }
  };

};
