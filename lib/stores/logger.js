var log4js = require('log4js');

module.exports = function (config) {
  //loads configuration from a given external file.
  //log4js has a nice feature that it reloads theconfiguration if it changes while the app is running
  //TODO: check log4js for memory leaks, it used to have some
  log4js.configure(config.logger.configuration);

  var logger = log4js.getLogger('csp');

  return {
    save: function (report) {
      //I hardcoded log level to warn, because that's what csp log is. 
      //Proper configuration will allow mixing it into a file with other logs
      logger.warn(report.getLog());
    }
  };
};
