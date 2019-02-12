# AdaLite Backend Service

[![CircleCI](https://circleci.com/gh/vacuumlabs/adalite-backend-service.svg?style=svg)](https://circleci.com/gh/vacuumlabs/adalite-backend-service)

AdaLite Backend Service is based on Project Icarus by IOHK and used by the [AdaLite](https://github.com/vacuumlabs/adalite) wallet.

# Setup

## Pre-requisites

* NodeJS v8.9.4. We recommend [nvm](https://github.com/creationix/nvm) to install it
* [Postgres](https://www.postgresql.org/) as DB engine.
* A database synchronized through [Icarus Importer](https://github.com/Emurgo/project-icarus-importer)

## Configuration

All the environment specific configurations can be found in `$PROJ_ROOT/config` folder.
They are loaded using [config](https://www.npmjs.com/package/config) package.

## Development environment

1.  Clone this repo, `git@github.com:vacuumlabs/adalite-backend-service.git`
2.  Select correct NodeJs version, `nvm use`
3.  Install dependencies, `yarn install`
4.  Transpile the source code, `yarn build`
5.  Start the app, `yarn start`.

In order to connect to the icarus importer DB from local environment, you need to:

1.  Create a `~/.env` file with the necessary environment variables set. E.g.:

```
DB_USER=dbUser
DB_HOST=dbHost
DB=dbName
DB_PASSWORD=password
DB_PORT=5432
IMPORTER_ENDPOINT=<link to your icarus importer API>
```
2.  Go to the repository's path
3.  Execute the following command: `yarn start`

## Production environment
Docker-compose can be used to run postgres, Icarus importer and the backend service in an isolated environment and to run multiple instances on the same host. Information about importer installation can be found [here](https://github.com/input-output-hk/project-icarus-importer/blob/icarus-master/blockchain-importer/README.md).
In order to start a production instance, you need to:

1. Create a config based on `docker/env.example`
2. Load the variables, e.g. `export $(cat docker/env.example | xargs)`
3. Run `docker-compose -p $instance_name up --build -d` where `$instance_name` is your name of choice

To shut the instance down:

1. Load the correct environment variables
2. Run `docker-compose -p $instance_name down`

To rebuild the backend service, run `docker-compose -p $instance_name up --build -d --no-deps --force-recreate adalite-backend`

## Database migrations

[Knex](https://knexjs.org/#Migrations) is used to handle the migrations. The connection settings are taken from `.env`.

Examples of migration commands:
```
yarn knex migrate:latest
yarn knex migrate:rollback
yarn knex migrate:make $name
```

## Slack integration

A healthcheck script is used to guarantee that the database contains the latest data. If the database stops updating, the backend service will stop responding to requests and a message will be sent to Slack. The following environment variables need to be set:
```
SLACK_TOKEN=slackToken
SLACK_CHANNEL=slackChannel
```

## Checks & Tests

### Flow and Eslint

* Flow checks: `yarn flow`
* Eslint checks: `yarn eslint`

### Unit tests

To run unit tests, you just need to run

`yarn unit-tests`

### Integration tests

Integration tests will:

1. Create a new DB
2. Preload sample data
3. Startup the application
4. Exercise and assert several endpoints

To do so, before running them, you need to be sure a PostgreSQL db instance is accessible from localhost
using the config saved in `~/config/test.js`, which is by default:

* Server: localhost
* User: postgres
* Password: mysecretpassword
* Port: 5432

Then, run `yarn integration-tests`

### Coverage

To run both unit and integration tests, execute `yarn coverage`

## License

Licensed under the [Apache License, Version 2.0](LICENSE.md)
