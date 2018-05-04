const { version } = require('../package.json');

/**
 * Temp function to be used while setting up the project
 */
const sayHi = (db, logger) => async (req, res, next) => {
  try {
    const result = await db.query('select $1::text as name', ['POC']);
    res.send(result.rows[0]);
    return next();
  } catch (err) {
    return next(new Error('boom!'));
  }
};

const healthCheck = (req, res, next) => {
  res.send({ version });
  return next();
};

module.exports = {
  sayHi,
  healthCheck,
};
