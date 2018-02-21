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
export const Throw = (error: Error) => Decorator(() => new ThrowInterceptor(error));

export class ThrowInterceptor
  implements SenderInterceptor, ReceiverInterceptor {

  constructor(private error: Error) {
  }

  handle(request: Request, next: RequestResolver):
    Promise<Response> {
    return this.intercept(request, next);
  }

  submit(request: Request, next: RequestResolver):
    Promise<Response> {
    return this.intercept(request, next);
  }

  private intercept(request: Request, next: RequestResolver): Promise<Response> {
    return Promise.reject(this.error);
  }
}
