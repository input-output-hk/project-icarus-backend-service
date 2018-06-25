var fetch = require("node-fetch"); //FIXME: Add as dependency?

const ExplorerApi = {};

ExplorerApi.config = {
  serverRoute: 'https://explorer.iohkdev.io/api'
};

const parseResponse = function (response) {
  return response.json();
};

const handleErrors = function (responseJson) {
  if (responseJson.error) {
    console.error(`[ExplorerApi.handleErrors] error[${responseJson.error.name}]`);
    throw responseJson.error;
  } else {
    return Promise.resolve(responseJson);
  }
};

ExplorerApi.txs = {};

ExplorerApi.txs.getInfo = async function (txId) {
  return fetch(`${ExplorerApi.config.serverRoute}/txs/summary/${txId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  })
  .then(parseResponse)
  .then(handleErrors);
};

module.exports = ExplorerApi;