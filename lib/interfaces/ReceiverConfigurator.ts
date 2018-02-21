import { HandledMessageType, ObjectType } from './types';

/**
 * A configurator to customize the message receiving process.
 */
export default interface ReceiverConfigurator {

  /**
   * Creates a map of message constructor functions as keys,
   * and corresponding configuration options as values.
   */
  build(): Map<ObjectType, HandledMessageType>;
}
