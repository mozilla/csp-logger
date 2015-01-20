# CSP Logger

A basic service for logging [content security policy](https://developer.mozilla.org/en-US/docs/Security/CSP) violations.

It handles saving violation reports for you. You can save logs to any SQL database or to any appender that log4js is capable of - mainly log files with rotation features and configuration. Logging to console and intercepting in your own application is supported too.

## Usage

Configure your CSP to report to the `/csp` route of this service. Incoming reports will be logged to your designated storage.

There are multiple ways to use csp-logger

**As a comand line tool**

```bash
npm install -g csp-logger
csp-logger -c config.json
```

**As a standalone app**

Clone this repository and run 
```bash
npm install .
node csp-logger.js -c config.json
```

**As a module in your application**

```javascript
var cspLogger = require("csp-logger")("config.json"); //accepts a matching object too
   
cspLogger.interceptReport(function(report,req){
    //this runs before the report is stored
    //react to CSP reports or return a modified version 

});
```

## Configuration

To get an example configuration file run csp-logger with following arguments: `-c example.json --example`
Configuration is a json file containing the following:

- `store` (String) - Choose a storage implementation from `lib/stores`, which currently gives you the choice of `sql`, `logger`, `console` or `nil`
- `domainWhitelist` (Array of Strings) - A whitelist of domains that will have CSP exceptions logged.
- `sourceBlacklist` (Array of Strings) - A list of sources to block from being recorded. 

### Store configurations:

**logger**

- `configuration` (String) - path to log4js configuration file. Logger name is `csp`

**sql**

- `dbDialect` (String) - Either `mysql`, `sqlite` or `postgres`.
- `dbHost` (String) - SQL server hostname.
- `dbName` (String) - Database name.
- `dbPort` (Number) - Port number of SQL server.
- `dbUsername` (String) - Username with write permissions for DB.
- `dbPassword` (String) - Password.

**console**

Just logs with `console.warn`

**nil**

Does nothing (useful when csp-logger is used as a module)

## Module API

The module returns a function accepting 3 arguments:

| configuration | required | Configure csp-logger - string path to configuration file or object matching the expected configuration |
| server to use | optional | Bind it to the same port as your app - anything that can be passed as `server` to `express().listen(server)` |
| testing | optional |  boolean stating if you want page throwing violations to be served at `/` for testing |

```javascript
var cspLogger = require("csp-logger")("config.json", server, true); 
```

### Intercepting violation reports

An initialized csp-logger instance exports two things:

`cspLogger.Report`

A report constructor. You can use it to base your implementation of report on it.

`cspLogger.interceptReport`

Sets a callback that will be called before each report is stored. 
If the callback returns a new object that implement `getLog` and `getRaw` methods - the new instance will be stored instead of the original report.


```javascript
var cspLogger = require("csp-logger")("config.json");

function MyReport(report, username){
    this.report = report;
    this.username = username
}

MyReport.prototype.getLog = function(){
    var log = this.report.getLog();
    log+="\n username: "+this.username;
    return log;
};

cspLogger.interceptReport(function(report, req){
    var username = getUsername(req);
    var myReport = new MyReport(report, username);
    return myReport;
});
```

Overriding `getRaw` requires the output to match SQL schema, so all modifications should be done only to existing fields. `other` field (type: TEXT) is prepared for the purpose of extensions. 

## Testing your policies

You can try it out with any policies by running `node csp-logger.js -c yourconfig.json --test` as it serves `test/index.html` file on the root path alongside the `/csp` route.
