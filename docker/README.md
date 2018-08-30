# Project Icarus Backend Service

Here is the docker file to build the backned service that connects to the Postgres DB synchronized with the blockchain through the Icarus Importer.

## How to build project-icarus-importer docker image

* run from the root project directory: `docker build -t icarus-backend-service -f - . < ./docker/Dockerfile`

## How to run the docker container

* `cp env.example env` and set properly the environment variables
* `docker run -d --name=icarus-backend-service --net="host" --env-file=docker/env icarus-backend-service`
