var MongoClient = require('mongodb').MongoClient;

module.exports = function (config) {
  var url = 'mongodb://' + config.sql.dbHost + ':' + config.sql.dbPort;

  MongoClient.connect(url, function(err, db) {
    if (err) {
      throw err;
    }

    var dbo = db.db(config.sql.dbName);
    dbo.createCollection('violations', function(err, res) {
      if (err) {
        throw err;
      }

      console.log('Collection created!');
      db.close();
    });
  });

  return {
    save: function (report) {

      MongoClient.connect(url, function(err, db) {
        if (err) {
          throw err;
        }

        var dbo = db.db(config.sql.dbName);

        dbo.collection('violations').insertOne(report, function(err, res) {
          if (err) {
            throw err;
          }
          
          console.log('1 document inserted');
          db.close();
        });
      });
    }
  };
};