#! /bin/bash

export PGPASSWORD=mysecretpassword; 

echo "Creating DB"
createdb -U postgres -h localhost icaruspocbackendservice-test > /dev/null
echo "Loading DB data"
psql -U postgres -h localhost icaruspocbackendservice-test < ./test/integration/test-db.sql > /dev/null
echo "Data loaded"
