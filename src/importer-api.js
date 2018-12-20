// @flow
import { post } from 'axios'

import type { ImporterApi } from 'icarus-backend'; // eslint-disable-line

export default (importerSendTxEndpoint: string): ImporterApi => ({
  sendTx: tx => post(importerSendTxEndpoint, tx),
})
