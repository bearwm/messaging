/**
 * A response wraps a message handling result with additional metadata.
 */
export default interface Response<T = any> {
  /**
   * An unique identifier of type UUID that matches the id of the request.
   */
  readonly id: string;

  /**
   * Additional response headers.
   */
  readonly headers?: { [key: string]: {} };

  /**
   * The result of the message handling process.
   */
  readonly data?: T;

  /**
   * An error message in case message handling process failed.
   * The error is set only when handling failed.
   */
  readonly error?: any;
}
