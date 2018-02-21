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
export const Retry = (attempts: number = 1, filter?: (error: any) => boolean) =>
  Decorator(() => new RetryInterceptor(attempts, filter));

export class RetryInterceptor
  implements SenderInterceptor, ReceiverInterceptor {
  constructor(
    private attempts: number = 1,
    private filter?: (error: any) => boolean) {
  }

  handle(request: Request<any>, next: RequestResolver, context: InterceptionContext):
    Promise<Response<any>> {
    return this.intercept(request, next, context);
  }

  submit(request: Request<any>, next: RequestResolver, context: InterceptionContext):
    Promise<Response<any>> {
    return this.intercept(request, next, context);
  }

  private async intercept(request: Request, next: RequestResolver, context: InterceptionContext):
    Promise<Response> {

    let attempts = this.attempts;
    let result = await next(request);

    while (attempts > 0 && this.shouldRetry(result)) {
      attempts -= 1;
      context.cancel();
      result = await next(request);
    }

    return result;
  }

  private shouldRetry(result: Response): boolean {
    return (result === undefined || result.error !== undefined) &&
      (this.filter === undefined || this.filter(result.error));
  }
}
