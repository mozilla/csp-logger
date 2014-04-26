var fs = require('fs');
var JSV = require('JSV').JSV;

var config = JSON.parse(fs.readFileSync('env.json', {
  encoding: 'utf8'
}));

var schema = JSON.parse(fs.readFileSync('env.schema.json', {
  encoding: 'utf8'
}));

var configValidationReport = JSV.createEnvironment().validate(config, schema);

// Validate env.json based on env.schema.json
if (configValidationReport.errors.length > 0) {
  console.error('env.json is invalid');
  console.error(configValidationReport.errors);
  process.exit(1);
}

module.exports = config;
