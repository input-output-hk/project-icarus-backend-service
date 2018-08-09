module.exports = {
  appName: 'yoroi-backend-service',
  server: {
    port: 8080,
    apiConfig: {
      addressesRequestLimit: 50,
      txHistoryResponseLimit: 20,
    },
  },
};
