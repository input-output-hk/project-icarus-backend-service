require('dotenv').config();

const server = require('./server');
// Don't check client certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

server();
