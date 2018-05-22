#! /bin/bash

MY_DIR="$(dirname "$0")"
source "$MY_DIR/helper.sh";

TAG=$1
NAME=$(readPackageJSON 'name');

docker stop $NAME || true && docker rm $NAME || true

source ~/icarus-backend-staging-env

docker run -d -e DB_USER=$DB_USER \
  -e DB_HOST=$DB_HOST \
  -e DB=$DB \
  -e DB_PASSWORD=$DB_PASSWORD \
  -e DB_PORT=$DB_PORT \
  -e NODE_ENV=staging \
  -e UV_THREADPOOL_SIZE=40 \
  --name $NAME \
  -p 8080:8080 icarus/$NAME:$TAG