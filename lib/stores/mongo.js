var Sequelize = require('sequelize');
var Report = require('../report');

module.exports = function (config) {
  var sequelizeDB = new Sequelize(config.sql.dbName, config.sql.dbUsername, config.sql.dbPassword, {
    host: config.sql.dbHost,
    dialect: config.sql.dbDialect,
    port: config.sql.dbPort
  });

  // Authenticate and connect to DB
  sequelizeDB
    .authenticate()
    .complete(function (err) {
      if (!!err) {
        console.log('Unable to connect to the database.');
      } else {
        console.log('Connection has been established successfully.');
      }
    });

  // Define schema
  var cspViolation = sequelizeDB.define('cspViolation', Report.prototype.getSQLDefinition(Sequelize));

  // Create table
  sequelizeDB.sync({}).complete(function (err) {
    if (!!err) {
      console.error('An error occurred while creating the table.');
    } else {
      console.log('Table created.');
    }
  });

  function storeViolation(report) {
    // Directly create record in DB
    cspViolation.create(report.getRaw()).complete(function () {
      console.log('Violation stored.');
    });
  }
  return {
    save: storeViolation
  };
};
