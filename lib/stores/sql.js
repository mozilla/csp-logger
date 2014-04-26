var sequelize = require('sequelize');
var config = require('./config');

var sequelizeDB = new sequelize(config.sql.dbName, config.sql.dbUsername, config.sql.dbPassword, {
  host: config.sql.dbHost,
  dialect: config.sql.dbDialect, // or 'sqlite', 'postgres', 'mariadb'
  port: config.sql.dbPort
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

module.exports = {
  save: storeViolation
};
