var http = require('http');
var fs = require('fs');
var url = require('url');
var sequelize = require('sequelize');
var JSV = require('JSV').JSV;
var express = require('express');

var app = express();

var config = JSON.parse(fs.readFileSync('./env.json', {
  encoding: 'utf8'
}));

var schema = JSON.parse(fs.readFileSync('./env.schema.json', {
  encoding: 'utf8'
}));

var configValidationReport = JSV.createEnvironment().validate(config, schema);

// Validate env.json based on env.schema.json
if (configValidationReport.errors.length > 0) {
  console.log('env.json is invalid');
  console.log(configValidationReport.errors);
  process.exit(1);
}

var sequelizeDB = new sequelize(config.dbName, config.dbUsername, config.dbPassword, {
  host: config.dbHost,
  dialect: config.dbDialect, // or 'sqlite', 'postgres', 'mariadb'
  port: config.dbPort
});

// Authenticate and connect to DB
sequelizeDB
  .authenticate()
  .complete(function (err) {
    if ( !! err) {
      console.log('Unable to connect to the database.');
    } else {
      console.log('Connection has been established successfully.');
    }
  });

// Define schema
var cspViolation = sequelizeDB.define('cspViolation', {
  documentURI: sequelize.STRING,
  violatedDirective: sequelize.STRING,
  originalPolicy: sequelize.TEXT,
  blockedURI: sequelize.STRING,
  sourceFile: sequelize.STRING,
  lineNumber: sequelize.INTEGER,
  statusCode: sequelize.INTEGER,
  userAgent: sequelize.TEXT // Non-standard property
});

// Create table
sequelizeDB.sync({
  //force: true // Remove existing tables and recreate them
}).complete(function (err) {
  if ( !! err) {
    console.error('An error occurred while creating the table.');
  } else {
    console.log('Table created.');
  }
});

function storeViolation(reportBody) {
  // Directly create record in DB
  cspViolation.create({
    documentURI: reportBody['document-uri'],
    violatedDirective: reportBody['violated-directive'],
    originalPolicy: reportBody['original-policy'],
    blockedURI: reportBody['blocked-uri'],
    sourceFile: reportBody['source-file'],
    lineNumber: reportBody['column-number'],
    statusCode: reportBody['status-code'],
    userAgent: reportBody.userAgent
  }).complete(function () {
    console.log('Violation stored.');
  });
}

function cspPost(req, res) {
  var bodyParts = [];
  var bytes = 0;

  req.on('data', function (c) {
    bodyParts.push(c);
    bytes += c.length;
  });

  req.on('end', function () {
    var json;
    var body;
    var userAgent = req.headers['user-agent'];

    // Attempt to parse JSON from stream
    try {
      body = Buffer.concat(bodyParts, bytes).toString('utf8');
      json = JSON.parse(body);
    } catch (ex) {
      console.log(body);
    }

    var violatorDomain = url.parse(json['csp-report']['document-uri']).host;
    var allowedDomain = false;
    var allowedSource = true;

    // Ensure domain is allowed to report
    config.domainWhitelist.forEach(function (domain) {
      if (violatorDomain === domain) {
        allowedDomain = true;
      }
    });

    // Ensure source isn't blacklisted
    if (config.sourceBlacklist) {
      config.sourceBlacklist.forEach(function (source) {
        if (json['csp-report']['source-file'] === source) {
          allowedSource = false;
        }
      });
    }

    // Log the CSP violation
    if (allowedDomain && allowedSource) {
      console.log('Attempting to store violation:');
      var report = json['csp-report'];
      report.userAgent = userAgent;
      storeViolation(report);
    } else {
      console.log('Ignoring CSP report');
    }
  });

  req.on('error', function () {
    console.log('req error');
  });

  res.writeHead(200);
  res.end();
}

// Return JSON of entire violations table

function cspGet(req, res) {
  var violations = [];

  cspViolation.findAll().success(function (table) {
    table.forEach(function (item) {
      violations.push(item.dataValues);
    });

    res.writeHead(200);
    res.write(JSON.stringify(violations));
    res.end();
  });
}

app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/csp', function (req, res, next) {
  cspGet(req, res);
});

app.post('/csp', function (req, res, next) {
  cspPost(req, res);
});

app.listen(2600);
