# Icaraus-backend-service

[![CircleCI](https://circleci.com/gh/input-output-hk/icarus-poc-backend-service.svg?style=svg)](https://circleci.com/gh/input-output-hk/icarus-poc-backend-service)

Yoroi backend service that will allow wallet users to access blockchain data

# Setup

## Pre-requisites

* NodeJS v8.9.4. We recommend [nvm](https://github.com/creationix/nvm) to install it
* [Postgres](https://www.postgresql.org/) as DB engine. For development purposes we
  suggest using Docker but local installation could be used as well (not both,
  obviously)

## Configuration

All the environment specific configurations can be found in `$PROJ_ROOT/config` folder.
They are loaded using [config](https://www.npmjs.com/package/config) package.

## Development environment

We recommend using [Docker](https://hub.docker.com/_/postgres/) to quickly setup the DB in dev environment:

`docker run --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=mysecretpassword -d postgres`

And then, to create the db, you need to do:

```
docker exec -it postgres psql -U postgres;
create database yoroibackendservice;
```

1.  Clone this repo, `git@github.com:input-output-hk/icaraus-poc-backend-service.git`
2.  Select correct NodeJs version, `nvm use`
3.  Install dependencies, `npm install`
4.  Start the app, `npm run dev`.

In order to run targeting staging DB from local environment, you need to:

1.  Create a file with the necessary environment variables set. E.g.:

```
export DB_USER=dbUser
export DB_HOST=dbHost
export DB=dbName
export DB_PASSWORD=password
export DB_PORT=8080
```

2.  Import the environment variables in your terminal, e.g: `source ~/path/to/file` (To verify
    the variables where exported: `echo $DB`)
3.  Go to the repository's path
4.  Execute the following command: `npm run dev`

## Checks & Tests

### Flow and Eslint

* Flow checks: `npm run flow`
* Eslint checks: `npm run eslint`

### Unit tests

To run unit tests, you just need to run

`npm run unit-tests`

### Integration tests

Integration tests will:

1- Create a new DB
2- Preload sample data
3- Startup the application
4- Exercise and assert several endpoints

To do so, before running them, you need to be sure a PostgreSQL db instance is accessible from localhost
using the following config:

* Server: localhost
* User: postgres
* Password: mysecretpassword
* Port: 5432

Then, run `export NODE_ENV=test; npm run integration-tests`

### Coverage

Istanbul will be used to get test coverage. It will execute both unit and integration tests. 

To run it, execute `npm run coverage`

## Production

TBD
