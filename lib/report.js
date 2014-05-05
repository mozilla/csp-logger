var _ = require('lodash');

function validate(data) {
  //note: browsers send different data 

  //safety reasons, prevent DOS
  _.each(data, function (e) {
    if (e.length > 10240) {
      throw new TypeError('Report data item too big');
    }
  });
  //TODO: expand this if needed. What makes a complete report?
  if (!data['document-uri']) {
    throw new TypeError('Malformed report data');
  }

}

function Report(reportData) {
  validate(reportData);
  this.data = {
    documentURI: reportData['document-uri'],
    violatedDirective: reportData['violated-directive'],
    originalPolicy: reportData['original-policy'],
    blockedURI: reportData['blocked-uri'],
    sourceFile: reportData['source-file'],
    lineNumber: reportData['line-number'],
    statusCode: reportData['status-code'],
    scriptSample: reportData['script-sample'],
    referrer: reportData.referrer,
    userAgent: reportData.userAgent
  };

}

Report.prototype.getSQLDefinition = function (sequelize) {
  return {
    documentURI: sequelize.STRING,
    violatedDirective: sequelize.STRING,
    originalPolicy: sequelize.TEXT,
    blockedURI: sequelize.STRING,
    sourceFile: sequelize.STRING,
    lineNumber: sequelize.INTEGER,
    statusCode: sequelize.INTEGER,
    scriptSample: sequelize.TEXT,
    referrer: sequelize.STRING,
    userAgent: sequelize.TEXT
  };
};

Report.prototype.getRaw = function () {
  return this.data;
};

function getLogLine(text, value) {

  return (value) ? '  ' + text + value + '\n' : '';

}

Report.prototype.getLog = function () {
  var logString = 'violation of [' + this.data.violatedDirective + ']' + ((this.data.originalPolicy) ? ' from [' + this.data.originalPolicy + ']' : '') + '\n' +
    '  on ' + this.data.documentURI + ' by ' + this.data.blockedURI + ((this.data.sourceFile) ? ' in ' + this.data.sourceFile + (this.data.lineNumber) ? ' line:' + this.data.lineNumber : '' : '') + '\n';

  logString += getLogLine('script: ', this.data.scriptSample);
  logString += getLogLine('agent: ', this.data.userAgent);
  logString += getLogLine('referrer: ', this.data.referrer);

  return logString;
};

module.exports = Report;
