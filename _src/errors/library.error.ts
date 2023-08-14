/**
 * @description                 - custom class for server errors
 * @param {string} super        - call the built-in "Error" class constructor
 * @param {string} message      - error message
 * @param {string} name         - the class name
 * @param {number} code         - numeric error code
 * @param {string} cause        - the circumstances in which the error occurred (the parent error message)
 * @param {string} stack        - current call stack
 * @return {object}             - error object
 */
// eslint-disable-next-line max-classes-per-file
export class UNCAUGHT_ERROR extends Error {
  code: number;
  cause: string;
  stack: string | undefined;

  constructor(message: string, cause: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = 1000;
    this.cause = cause;
  }
}

export class SRV_ERROR extends UNCAUGHT_ERROR {
  constructor(message: string, cause: string) {
    message = `[SRV_ERROR] ${message}`;
    super(message, cause);
    this.code = 1100;
  }
}
