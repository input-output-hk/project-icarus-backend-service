#! /bin/bash

MY_DIR="$(dirname "$0")"
source "$MY_DIR/helper.sh";

# Version key/value should be on his own line
PACKAGE_VERSION=$(readPackageJSON 'version');
NAME=$(readPackageJSON 'name');

flow-remove-types ./src/ -d ./flow-files/ --all --pretty;

docker build -t "icarus/$NAME:$PACKAGE_VERSION" -f ./docker/Dockerfile .
