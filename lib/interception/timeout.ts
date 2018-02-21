import MessagingError from '../core/MessagingError';
import Decorator from '../annotation/Decorator';
import {
  RequestResolver,
  SenderInterceptor,
  ReceiverInterceptor,
  Request,
  Response,
  InterceptionContext,
} from '../interfaces';

// tslint:disable-next-line:variable-name
export const Timeout = (timeout: number) => Decorator(() => new TimeoutInterceptor(timeout));

export class TimeoutInterceptor
  implements SenderInterceptor<any, any>, ReceiverInterceptor<any, any> {

  constructor(private timeout: number) { }

  handle(request: Request, next: RequestResolver, context: InterceptionContext):
    Promise<Response> {
    return this.intercept(request, next, context);
  }

  submit(request: Request, next: RequestResolver, context: InterceptionContext):
    Promise<Response> {
    return this.intercept(request, next, context);
  }

  private intercept(
    request: Request,
    next: RequestResolver,
    context: InterceptionContext,
  ): Promise<Response> {

    let timeoutId;
    const promiseTimeout = new Promise<Response>((res, rej) => {
      timeoutId = setTimeout(
        () => {
          context.cancel();
          rej(new MessagingError('timeout'));
        },
        this.timeout);
    });

    context.onCancel(ctx => clearTimeout(timeoutId));

    return Promise.race([next(request), promiseTimeout])
      .then((result) => {
        clearTimeout(timeoutId);
        return result;
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        throw error;
      });
  }
}
