// @flow

const withPrefix = route => `/api${route}`;

const simpleTest = (testApi) => async () => {
  const res = await testApi.simpleTest();
  return res.rows;
};

module.exports = {
  simpleTest: {
    method: 'get',
    path: withPrefix('/test'),
    handler: simpleTest,
  },
};
