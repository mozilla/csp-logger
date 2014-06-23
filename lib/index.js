var Report = require('./report');

module.exports = function (conf, existingServerToUse, testing) {
  var config;
  var handler;

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
    }
  };

};