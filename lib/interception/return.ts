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
export const Return = <TResult>(result: TResult) => Decorator(() => new ReturnInterceptor(result));

export class ReturnInterceptor<TResult>
  implements SenderInterceptor, ReceiverInterceptor {

  constructor(private result: TResult) {
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
    return Promise.resolve(<Response>{ id: request.id, data: this.result, headers: {} });
  }
}
