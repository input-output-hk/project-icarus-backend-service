import type { Logger } from 'bunyan';
import type { ResultSet } from 'pg';

declare module types {
  declare type LoggerObject = {
    logger: Logger,
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
    query: {
      order: string,
    },
  };

  declare type SignedTxRequest = {
    body: {
      addresses: Array<string>,
      signedTx: string,
    },
  };

  declare type DbApi = {
    filterUsedAddresses: (addresses: Array<string>) => Promise<ResultSet>,
    utxoForAddresses: (addresses: Array<string>) => Promise<ResultSet>,
    utxoSumForAddresses: (addresses: Array<string>) => Promise<ResultSet>,
    transactionsHistoryForAddresses: (
      addresses: Array<string>,
      dateFrom: Date,
      txHash: ?string,
    ) => Promise<ResultSet>,
  };
}
