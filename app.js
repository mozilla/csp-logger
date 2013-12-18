var http = require('http');
var fs = require('fs');
var sequelize = require('sequelize');
var JSV = require('JSV').JSV;

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

    var violatorDomain = json['csp-report']['document-uri'].match(/\/\/(.*)\//)[1];
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

http.createServer(function (req, res) {
  console.log('Incoming request: ' + req.url);

  function fail() {
    res.writeHead(404);
    res.end();
  }

  switch (req.url) {
  case '/csp':
  case '/csp/':
    if (req.method === 'POST') {
      cspPost(req, res);
    } else {
      fail();
    }
    break;
  default:
    fail();
    break;
  }
}).listen(2600);
