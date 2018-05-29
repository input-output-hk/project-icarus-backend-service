import type { Logger } from 'bunyan';

declare module types {
  declare type LoggerObject = { 
    logger: Logger
  };
}