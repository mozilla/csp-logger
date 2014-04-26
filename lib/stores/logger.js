var log4js = require('log4js');

var logger = log4js.getLogger('csp');

module.exports = {
  save: function (logData) {
    logger.info(logData);
  }
};
