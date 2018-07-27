#! /bin/node

const config = require('config');
const { execFileSync, execSync } = require('child_process');

const { host, password, user, database } = config.get('db');

process.env.PGPASSWORD = password;

try {
  console.log('Creating DB');
  execFileSync('createdb', [`-U${user}`, `-h${host}`, database]);
  console.log('Loading Data');
  execSync(
    'psql -U postgres -h localhost icaruspocbackendservice-test < ./test/integration/test-db.sql',
  );
} catch (err) {
  // DB is already present, it's fine
}
