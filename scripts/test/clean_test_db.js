#! /bin/node

const config = require('config')
const { execFileSync } = require('child_process')

const { host, password, user, database } = config.get('db')

process.env.PGPASSWORD = password

execFileSync('dropdb', [`-U${user}`, `-h${host}`, database])
