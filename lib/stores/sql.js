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
    .then(function () {
      console.log('Connection has been established successfully.');
    })
    .catch(function (err) {
      console.error('Unable to connect to the database:', err);
    });

  // Define schema
  var cspViolation = sequelizeDB.define('cspViolation', Report.prototype.getSQLDefinition(Sequelize));

  // Create table
  sequelizeDB.sync({}).then(function (err) {
    console.log('Table created.');
  })
  .catch(function (err) {
    console.error('An error occurred while creating the table.');
  });

  function storeViolation(report) {
    // Directly create record in DB
    cspViolation.create(report.getRaw()).then(function () {
      console.log('Violation stored.');
    });
  }
  return {
    save: storeViolation
  };
};
