#!/usr/bin/env bash

sed s/IMPORTER_ENDPOINT/$IMPORTER_ENDPOINT/ < config/staging-beta.js.tpl > config/staging-beta.js
pm2 start ./flow-files/index.js -i 0 --no-daemon
