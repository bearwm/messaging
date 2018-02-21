import Response from './Response';
import Request from './Request';

/**
 * A message dispatcher. 
 * The dispatcher is responsible for delivering messages to the observer.
 */
export default interface Dispatcher {
  dispatch<TMessage, TResult>(request: Request<TMessage>):
    Promise<Response<TResult>>;

  forget<TMessage>(request: Request<TMessage>): void;
}
