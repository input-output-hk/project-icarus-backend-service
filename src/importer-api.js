// @flow
const axios = require('axios');

import type { ImporterApi } from 'icarus-backend'; // eslint-disable-line

module.exports = (importerSendTxEndpoint: string): ImporterApi => ({
  sendTx: tx => axios.post(importerSendTxEndpoint, tx),
});
