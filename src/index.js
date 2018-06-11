const server = require('./server');
// Don't check client certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// eslint-disable-next-line no-console
server().catch(err => console.error('Error!', err));
