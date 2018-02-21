import { RequestResolver } from './types';

/**
 * A message observer.
 * The observer is responsible for receiving messages from dispatcher.
 */
export default interface Observer {
  /**
   * Subscribes a callback to be executed on a received message.
   * The response of the callback will be propagated back to the sender.
   */
  onMessage(delegate: RequestResolver): void;
}
