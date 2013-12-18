# CSP Logger

A basic service for logging [content security policy](https://developer.mozilla.org/en-US/docs/Security/CSP) violations to a SQL database.

## Setup

Create a copy of `env.json.dist` called `env.json` to contain your app specific config. This should be fairly straightforward, but for reference:

- `dbDialect` (String) - Either `mysql`, `sqlite` or `postgres`.
- `dbHost` (String) - SQL server hostname.
- `dbName` (String) - Database name.
- `dbPort` (Number) - Port number of SQL server.
- `dbUsername` (String) - Username with write permissions for DB.
- `dbPassword` (String) - Password.
- `domainWhitelist` (Array of Strings) - A whitelist of domains that will have CSP exceptions logged.
- `sourceBlacklist` (Array of Strings) - A list of sources to block from being recorded. 

## Usage

Configure your CSP to report to the `/csp` route of this service. Incoming reports will be logged to the `cspViolations` table of your designated SQL database.