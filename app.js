var http = require('http');
var sequelize = require('sequelize');

var sequelizeDB = new sequelize('csp', 'root', 'root', {
  dialect: 'mysql', // or 'sqlite', 'postgres', 'mariadb'
  port: 8889 // or 5432 (for postgres)
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
  statusCode: sequelize.INTEGER
});

// Create table
sequelizeDB.sync({
  //force: true // Remove existing tables and recreate them
}).complete(function (err) {
  if ( !! err) {
    console.log('An error occurred while creating the table.');
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
    statusCode: reportBody['status-code']
  }).complete(function () {
    console.log('Violation stored.');
  });
}

http.createServer(function (req, res) {
  console.log('Incoming request: ' + req.url);

  var bodyParts = [];
  var bytes = 0;

  req.on('data', function (c) {
    bodyParts.push(c);
    bytes += c.length;
  });

  req.on('end', function () {
    var json, body;

    try {
      body = Buffer.concat(bodyParts, bytes).toString('utf8');
      json = JSON.parse(body);
      console.log('Attempting to store violation:');
      console.log(json);
      storeViolation(json['csp-report']);
    } catch (ex) {
      console.log(body);
    }
  });

  req.on('close', function () {
    console.log('req close');
  });

  req.on('error', function () {
    console.log('req error');
  });

  res.writeHead(200, {
    'content-type': 'text/plain'
  });

  if (req.url === '/csp') {
    console.log('csp request made');
  }

  res.end();
}).listen(2600);
