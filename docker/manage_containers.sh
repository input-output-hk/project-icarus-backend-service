#!/bin/bash

if [ "$1" == "" ]; then
  echo "instance name is missing"
  exit 1
fi

if [ "$2" != "start-normal" ] && [ "$2" != "start-recovery" ] && [ "$2" != "stop" ]; then
  echo "Action must be either start-normal, start-recovery or stop"
  exit 1
fi

instance_name=$1
action=$2

export ICARUS_IMPORTER_PARAMS=""
if [ $action == "start-recovery" ]; then
  export ICARUS_IMPORTER_PARAMS="--recovery-mode"
fi

set -e

cp .env.$instance_name .env

export COMPOSE_PROJECT_NAME=$instance_name

if [ $action != "stop" ]; then
  docker-compose build
fi

docker-compose down

if [ $action == "start-recovery" ] || [ $action == "start-normal" ]; then
  docker-compose up -d
fi

rm .env
