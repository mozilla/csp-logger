function validate(data) {
  //TODO: check if data is a complete report
  //note: browsers send different data 
}

function Report(reportData) {
  validate(reportData);
  this.data = {
    documentURI: reportData['document-uri'],
    violatedDirective: reportData['violated-directive'],
    originalPolicy: reportData['original-policy'],
    blockedURI: reportData['blocked-uri'],
    sourceFile: reportData['source-file'],
    lineNumber: reportData['column-number'],
    statusCode: reportData['status-code'],
    userAgent: reportData.userAgent
  };

}

Report.prototype.getRaw = function () {
  return this.data;
};

Report.prototype.getLog = function () {
  return 'nice log format';
};

module.exports = Report;
