var config = require('./config');
var Report = require('./report');
var _ = require('lodash');
var url = require('url');
var express = require('express');

var app = express();
var storeViolation;

function isAllowed(domain, source) {
  console.log(domain, source);
  return (
    _.contains(config.domainWhitelist, domain) && !_.contains(config.sourceBlacklist, source)
  );
}

//CORS is not the best of ideas for CSP logging server
//It allows easy DDOS to cover other malicious activity
//TODO: consider removing this functionality at all
if (config.allowedOriginString) {
  app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', config.allowedOrigin);
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
  });
}

app.use(express.json());

app.post('/csp', function (req, res) {
  //console.log(req.headers, req.body);
  var userAgent = req.headers['user-agent'];
  var reportData;
  var report;
  var bodyObj = req.body;
  var violatorDomain;

  if (bodyObj && bodyObj['csp-report']) {
    reportData = bodyObj['csp-report'];
    violatorDomain = url.parse(reportData['document-uri']).host;

    if (isAllowed(violatorDomain, reportData['source-file'])) {
      reportData.userAgent = userAgent;
      report = new Report(reportData);

      if (storeViolation) {
        storeViolation(report, req);
      }
    }

  }

  res.end();

});

module.exports = {
  extend: function (cb) {
    cb(app);
  },
  listen: function (port, callback) {
    storeViolation = callback;
    app.listen(port);
    console.log('Server listening on port ' + port);
  }
};
