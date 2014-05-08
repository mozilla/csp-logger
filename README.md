# CSP Logger

A basic service for logging [content security policy](https://developer.mozilla.org/en-US/docs/Security/CSP) violations.

It handles saving violation reports for you. You can save logs to any SQL database or to any appender that log4js is capable of - mainly log files with rotation features and configuration.

## Setup

Enter `conf` folder and create a copy of `env.json.dist` called `env.json` to contain your app specific config. 

- `store` (String) - Choose a storage implementation from `lib/stores`, which currently gives you the choice of `sql` or `logger`
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


## Usage

Configure your CSP to report to the `/csp` route of this service. Incoming reports will be logged to the `cspViolations` table of your designated SQL database.

## Testing policies

You can try it out with any policies by running tester.js instead of app.js as it serves `test/index.html` file on the root path of your server alongside the `/csp` route.