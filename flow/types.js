import type { Logger } from 'bunyan';

declare module types {
  declare type LoggerObject = { 
    logger: Logger
  };

  declare type Request = {
    body: {
      addresses: Array<string>
    }
  };

  declare type Response = {
    send: Function
  };

  declare type TxHistoryRequest = {
    body: {
      addresses: Array<string>,
      dateFrom: Date
    },
    query: {
      order: string
    }
  }

  declare type SignedTxRequest = {
    body: {
      addresses: Array<string>,
      signedTx: string
    }
  }
}
