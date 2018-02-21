/**
 * A message interception context. 
 * The interception process can be viewed as a linked list, where
 * each interceptor is an item in the list with its own context.
 */
export default interface InterceptionContext<T = any> {
  /**
   * Gets data associated with current context
   */
  data(): T;

  /**
   * Gets a value indicating whether this context is canceled.
   */
  isCanceled(): boolean;

  /**
   * Cancels the context.
   */
  cancel(): void;

  /**
   * Allows subscribing a callback for notification of a cancel operation.
   */
  onCancel(notifier: (context: InterceptionContext<T>) => void): void;
}
