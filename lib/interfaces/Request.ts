import { Type } from './types';

/**
 * A request wraps a message with additional metadata.
 */
export default interface Request<T = any> {
  /**
   * An unique identifier of type UUID.
   */
  readonly id: string;

  /**
   * Describes the type of the message.
   */
  readonly type: Type;

  /**
   * Additional request headers.
   */
  readonly headers?: { [key: string]: {} };

  /**
   * Original message.
   */
  readonly data: T;
}
