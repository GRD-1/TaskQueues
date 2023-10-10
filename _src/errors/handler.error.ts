import Emitter from 'events';
import { UNCAUGHT_ERROR, SRV_ERROR } from './library.error';
const logger = { error: (a: string, b?: Error): void => console.log(a, b.message) };

class ErrorHandler {
  private static _instance: ErrorHandler;

  private constructor() {
    globalThis.ERROR_EMITTER = new Emitter();
    globalThis.UNCAUGHT_ERROR = UNCAUGHT_ERROR;
    globalThis.SRV_ERROR = SRV_ERROR;
  }

  setErrorListener(): void {
    globalThis.ERROR_EMITTER.on('Error', async (e) => {
      logger.error('\n', e);
    });

    process.on('uncaughtException', (e) => {
      try {
        const error = globalThis.UNCAUGHT_ERROR;
        error.cause = e.message;
        error.message = 'UNCAUGHT ERROR!!!';
        error.code = 1000;
        error.stack = e.stack;
        logger.error('\n', error);
        process.exit(1);
        setTimeout(() => {
          process.abort();
        }, 1000).unref();
      } catch (err) {
        logger.error('\n', err);
      }
    });
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler._instance) {
      ErrorHandler._instance = new ErrorHandler();
    }
    return ErrorHandler._instance;
  }
}

export default ErrorHandler.getInstance();
