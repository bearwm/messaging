import { MessageType, ObjectType } from './types';

/**
 * A configurator to customize the message sending process.
 */
export default interface SenderConfigurator {
  /**
   * Creates a map of message constructor functions as keys,
   * and corresponding configuration options as values.
   */
  build(): Map<ObjectType, MessageType>;
}
