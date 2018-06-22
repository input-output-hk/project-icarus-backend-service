import type { Logger } from 'bunyan';
import type { ResultSet } from 'pg';

declare module 'icarus-backend' {
  declare type ServerConfig = {
    logger: Logger,
    apiConfig: ApiConfig
  };

  declare type ApiConfig = {
    addressesRequestLimit: number,
    txHistoryResponseLimit: number,
  };

  declare type Request = {
    body: {
      addresses: Array<string>,
    },
  };

  declare type Response = {
    send: Function,
  };

  declare type TxHistoryRequest = {
    body: {
      addresses: Array<string>,
      dateFrom: Date,
      txHash: ?string,
    },
  };

  declare type SignedTxRequest = {
    body: {
      signedTx: string,
    },
  };

  declare type DbApi = {
    filterUsedAddresses: (addresses: Array<string>) => Promise<ResultSet>,
    unspentAddresses: () => Promise<ResultSet>,
    utxoForAddresses: (addresses: Array<string>) => Promise<ResultSet>,
    utxoSumForAddresses: (addresses: Array<string>) => Promise<ResultSet>,
    transactionsHistoryForAddresses: (
      limit: number,
      addresses: Array<string>,
      dateFrom: Date,
      txHash: ?string,
    ) => Promise<ResultSet>,
    pendingTransactionsForAddresses: (addresses: Array<string>) => Promise<ResultSet>,
  };
}
