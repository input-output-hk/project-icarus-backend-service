# Icaraus-backend-service

Icarus backend service that will allow wallet users to access blockchain data

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
create database icaruspocbackendservice;
```

1.  Clone this repo, `git@github.com:input-output-hk/icaraus-poc-backend-service.git`
2.  Select correct NodeJs version, `nvm use`
3.  Install dependencies, `npm install`
4.  Start the app, `npm run dev`.

## Production

TBD
