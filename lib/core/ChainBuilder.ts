import { Handler, InterceptionContext } from '../interfaces';

export class ChainBuilder {
  build<TIn, TOut>(
    action: (context: InterceptionContext<TIn>) => Promise<TOut>,
    interceptors: ChainBuilder.Interceptor<TIn, TOut>[]):
    ChainBuilder.Resolver<TIn, TOut> {

    const decorators = interceptors.map(m => decorateInterceptor(m));
    const target: ChainBuilder.Resolver<Context<TIn>, TOut> = decorateAction(ctx => action(ctx));

    const chain = decorators.reduceRight<ChainBuilder.Resolver<Context<TIn>, TOut>>(
      (next, intercept) => ctx => intercept(ctx, data => next(ctx.next(data))),
      target);

    return input => chain(Context.start(input));
  }
}

export namespace ChainBuilder {
  export type Resolver<TIn, TOut> = (x: TIn) => Promise<TOut>;
  export type Interceptor<TIn, TOut> =
    (context: InterceptionContext<TIn>, next: Resolver<TIn, TOut>) => Promise<TOut>;
}

function decorateInterceptor<TIn, TOut>(interceptor: ChainBuilder.Interceptor<TIn, TOut>):
  ChainBuilder.Interceptor<TIn, TOut> {

  return (context, next) => {
    const intercept = decorateAction<TIn, TOut>(ctx => interceptor(ctx, next));
    return intercept(context);
  };
}

function decorateAction<TIn, TOut>(action: ChainBuilder.Resolver<InterceptionContext<TIn>, TOut>):
  ChainBuilder.Resolver<InterceptionContext<TIn>, TOut> {

  return (context: Context<TIn>) => {
    if (context.isCanceled()) return never();

    return new Promise<TOut>((res, rej) => { action(context).then(res, rej); })
      .then(
      result => !context.isCanceled() ? result : never<TOut>(),
      error => !context.isCanceled() ? Promise.reject(error) : never<TOut>(),
    );
  };
}

function never<T>() {
  return new Promise<T>((res, rej) => { });
}

class Context<T = any> implements InterceptionContext<T> {
  private inner: Context<T>;
  private canceled: boolean = false;
  private notifiers: ((token: Context<T>) => void)[] = [];

  private constructor(private contextData: T) { }

  static start<T>(data: T) {
    return new Context(data);
  }

  next(data: T): Context<T> {
    return this.inner = new Context(data);
  }

  data(): T {
    return this.contextData;
  }

  isCanceled() {
    return this.canceled;
  }

  cancel(isInitiator: boolean = true) {
    if (this.inner) {
      this.inner.cancel(false);
      this.inner = null;
    }

    if (!isInitiator) {
      this.canceled = true;
      this.notifiers.forEach((notify) => {
        try {
          notify(this);
        } catch (error) {
          // ignore errors thrown during error notification
        }
      });
    }
  }

  onCancel(notifier: (token: Context<T>) => void) {
    this.notifiers.push(notifier);
  }
}
