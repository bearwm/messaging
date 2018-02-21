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
export const Delay = (timeout: number) => Decorator(() => new DelayInterceptor(timeout));

export class DelayInterceptor
  implements SenderInterceptor, ReceiverInterceptor {

  constructor(private timeout: number) {
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
    return new Promise<Response>((res, rej) => {
      setTimeout(() => { res(next(request)); }, this.timeout);
    });
  }
}
