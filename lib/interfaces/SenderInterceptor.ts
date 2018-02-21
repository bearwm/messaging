import Request from './Request';
import Response from './Response';
import { RequestResolver } from './types';
import InterceptionContext from './InterceptionContext';

export default interface SenderInterceptor<TMessage = any, TResult = any> {
  submit(
    request: Request<TMessage>,
    next: RequestResolver<TMessage, TResult>,
    context: InterceptionContext<Request<TMessage>>,
  ): Promise<Response<TResult>>;
}
