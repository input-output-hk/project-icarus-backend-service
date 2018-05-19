const config = require('config');
const ApiBuilder = require('claudia-api-builder');
const iopipe = require('@iopipe/iopipe')({
  token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhOGZjNDY0MS04OGNkLTRiMDMtYjNmZC1iNmY3MmEwY2JmYmMiLCJqdGkiOiJlODU5MWYzYS00NWM4LTRjYTgtOWZiNy1kMDE4YTY1YTI5NWEiLCJpYXQiOjE1MjkwODYzMDAsImlzcyI6Imh0dHBzOi8vaW9waXBlLmNvbSIsImF1ZCI6Imh0dHBzOi8vaW9waXBlLmNvbSxodHRwczovL21ldHJpY3MtYXBpLmlvcGlwZS5jb20vZXZlbnQvLGh0dHBzOi8vZ3JhcGhxbC5pb3BpcGUuY29tIn0.xS5511qoHhCcrV1hEW2FAAAZnqxiCG3cY19RzTC9PO8',
});
const pg = require('pg');
const routes = require('./flow-files/routes');
const dbApi = require('./flow-files/db-api');

const serverConfig = config.get('server');
const api = new ApiBuilder();

Object.values(routes).forEach(({ method, path, handler }) => {
  api[method](path, async req => {
    const db = new pg.Client(config.get('db'));
    await db.connect();
    try {
      serverConfig.context = req.lambdaContext;
      return await handler(dbApi(db), serverConfig)(req);
    } finally {
      db.end();
    }
  });
});
api.proxyRouter = iopipe(api.proxyRouter);

module.exports = api;

