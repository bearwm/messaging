/**
 * A message handler is responsible to respond to messages of a specific type.
 */
export default interface Handler<TMessage = any, TResult = any> {
  /**
   * Handles the message and returns a result, promise or undefined.
   * @argument message the input message
   */
  handle(message: TMessage): TResult | Promise<TResult> | void;
}
