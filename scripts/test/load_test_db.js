#! /bin/node

const config = require('config');
const { execFileSync, execSync } = require('child_process');

const { host, password, user, database } = config.get('db');

process.env.PGPASSWORD = password;

const runDBCommand = fn => {
  try {
    fn();
  } catch (err) {
    // do nothing
  }
};

try {
  console.log('Creating DB');
  runDBCommand(() => execFileSync('createdb', [`-U${user}`, `-h${host}`, database]));
  console.log('Loading Data');
  runDBCommand(() => execSync(`psql -U ${user} -h ${host} ${database} < ./test/integration/test-db.sql`));
} catch (err) {
  // DB is already present, it's fine
}
