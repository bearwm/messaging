import { expect } from 'chai';
import { spy } from 'sinon';
import { ChainBuilder } from '../../../lib/core/ChainBuilder';
import { InterceptionContext } from '../../../lib';
import { setTimeout } from 'timers';

describe('ChainBuilder', () => {
  let builder: ChainBuilder;

  beforeEach(() => {
    builder = new ChainBuilder();
  });

  class Input { }
  class Output { }

  const testInput = new Input();
  const testOutput = new Output();
  const testAction = (ctx: InterceptionContext<Input>) => Promise.resolve(testOutput);

  const interceptor1 = (input: InterceptionContext<Input>, next: (i: Input) => Promise<Output>) => {
    return new Promise((res) => {
      setTimeout(() => res(next(input.data())), 10);
    });
  };

  const interceptor2 = (input: InterceptionContext<Input>, next: (i: Input) => Promise<Output>) => {
    return next(input.data());
  };

  const rejectingInterceptor = (
    input: InterceptionContext<Input>,
    next: (i: Input) => Promise<Output>) => {
    return Promise.reject(new Error('test'));
  };

  const throwingInterceptor = (
    input: InterceptionContext<Input>,
    next: (i: Input) => Promise<Output>) => {
    throw new Error('test');
  };

  describe('When built without middlewares', () => {
    it('Should return a function', () => {
      const chain = builder.build(testAction, []);
      expect(chain).is.instanceOf(Function);
    });

    it('Should return the expected result', () => {
      const chain = builder.build(testAction, []);
      return expect(chain(testInput)).eventually.to.equal(testOutput);
    });

    it('Should reject on throwing action', () => {
      const action = (input: Input) => { throw new Error('test'); };
      const chain = builder.build(action, []);
      return expect(chain(testInput)).eventually.to.be.rejectedWith('test');
    });

    it('Should reject on rejected action', () => {
      const action = (input: Input) => Promise.reject(new Error('test'));
      const chain = builder.build(action, []);
      return expect(chain(testInput)).eventually.to.be.rejectedWith('test');
    });

    it('Should call action with expected input', () => {
      const action = spy(testAction);
      const chain = builder.build(action, []);
      chain(testInput);

      expect(action.args[0][0].data()).equals(testInput);
    });

    it('Should execute action on each chain call', () => {
      const action = spy(testAction);

      const chain = builder.build(action, []);
      chain(testInput);
      chain(testInput);

      expect(action.calledTwice).is.true;
    });
  });

  describe('When built with one middleware', () => {
    it('Should return a function', () => {
      const chain = builder.build(testAction, [interceptor1]);
      expect(chain).is.instanceOf(Function);
    });

    it('Should return the expected result', () => {
      const chain = builder.build(testAction, [interceptor1]);
      const result = chain(testInput);

      return expect(result).eventually.equals(testOutput);
    });

    it('Should reject on throwing action', () => {
      const action = (input: Input) => { throw new Error('test'); };
      const chain = builder.build(action, [interceptor1]);
      return expect(chain(testInput)).eventually.to.be.rejectedWith('test');
    });

    it('Should reject on rejected action', () => {
      const action = (input: Input) => Promise.reject(new Error('test'));
      const chain = builder.build(action, [interceptor1]);
      return expect(chain(testInput)).eventually.to.be.rejectedWith('test');
    });

    it('Should reject on throwing middleware', () => {
      const chain = builder.build(testAction, [throwingInterceptor]);
      const result = chain(testInput);

      return expect(result).eventually.to.be.rejectedWith('test');
    });

    it('Should reject on rejected middleware', () => {
      const chain = builder.build(testAction, [rejectingInterceptor]);
      const result = chain(testInput);

      return expect(result).eventually.to.be.rejectedWith('test');
    });

    it('Should call action on chain call', () => {
      const action = spy(testAction);
      const chain = builder.build(action, [interceptor1]);

      return chain(testInput).then(() => {
        expect(action.args[0][0].data()).equals(testInput);
        expect(action.calledOnce).is.true;
      });
    });

    it('Should call middleware on chain call', () => {
      const mw = spy(interceptor1);
      const chain = builder.build(testAction, [mw]);
      const result = chain(testInput);

      expect(mw.calledOnce).to.be.true;
      expect(mw.args[0][0].data()).equals(testInput);
    });

    it('Should not call action if middleware next skipped', () => {
      const output = new Output();
      const middlewareCancel = (
        ctx: InterceptionContext,
        next: (i: Input) => Promise<Output>) => {
        return Promise.resolve(output);
      };

      const action = spy(testAction);
      const chain = builder.build(action, [middlewareCancel]);
      const result = chain(testInput);

      expect(action.notCalled).to.be.true;
    });

    it('Should return the result from middleware', () => {
      const output = new Output();
      const middlewareCancel = (
        ctx: InterceptionContext,
        next: (i: Input) => Promise<Output>) => {

        return Promise.resolve(output);
      };

      const action = spy(testAction);
      const chain = builder.build(action, [middlewareCancel]);
      const result = chain(testInput);

      return expect(result).eventually.equals(output);
    });

    it('Should not call ctx.onCancel if canceled before next call', () => {
      const middlewareCancel = (
        ctx: InterceptionContext,
        next: (i: Input) => Promise<Output>) => {
        ctx.cancel();
        return next(ctx.data());
      };

      let isCanceled = false;
      const action = (ctx: InterceptionContext) => {
        ctx.onCancel(() => isCanceled = true);
        return Promise.resolve(testOutput);
      };

      const chain = builder.build(action, [middlewareCancel]);
      const result = chain(testInput);

      return expect(isCanceled).to.be.false;
    });

    it('Should return the result even if onCancel handler is throwing', () => {
      const middlewareCancel = (
        ctx: InterceptionContext,
        next: (i: Input) => Promise<Output>) => {
        const p = next(ctx.data());
        ctx.cancel();
        return Promise.resolve(new Output());
      };

      const action = (ctx: InterceptionContext) => {
        ctx.onCancel(() => { throw new Error('cancel'); });
        return Promise.resolve(testOutput);
      };

      const chain = builder.build(action, [middlewareCancel]);
      const result = chain(testInput);

      return expect(result).eventually.to.be.instanceOf(Output);
    });

    it('Should call ctx.onCancel if canceled after next call', () => {
      const middlewareCancel = (
        ctx: InterceptionContext,
        next: (i: Input) => Promise<Output>) => {

        const p = next(ctx.data());
        ctx.cancel();
        return p;
      };

      let isCanceled = false;
      const action = (ctx: InterceptionContext) => {
        ctx.onCancel(() => isCanceled = true);
        return Promise.resolve(testOutput);
      };

      const chain = builder.build(action, [middlewareCancel]);
      const result = chain(testInput);

      return expect(isCanceled).to.be.true;
    });

    it('Should return the expected result if next called twice', () => {
      const middlewareCancel = (
        ctx: InterceptionContext,
        next: (i: Input) => Promise<Output>) => {

        next(ctx.data());
        return next(ctx.data());
      };

      const action = spy(testAction);
      const chain = builder.build(action, [middlewareCancel]);
      const result = chain(testInput);

      expect(action.calledTwice).is.true;
      return expect(result).eventually.equals(testOutput);
    });

    it('Should not resolve if context is canceled', () => {
      const middlewareCancel = (
        ctx: InterceptionContext,
        next: (i: Input) => Promise<Output>) => {

        const p = next(ctx.data());
        ctx.cancel();
        return p;
      };

      const chain = builder.build(testAction, [middlewareCancel]);
      const result = chain(testInput);

      return Promise.race([
        result.then(() => { throw new Error('Should not resolve.'); }),
        new Promise((res) => { setTimeout(() => { res(); }, 20); }),
      ]);
    });

    it('Should not resolve on throwing action if context is canceled', () => {
      const middlewareCancel = (
        ctx: InterceptionContext,
        next: (i: Input) => Promise<Output>) => {

        const p = next(ctx.data());
        ctx.cancel();
        return p;
      };

      const chain = builder.build((ctx) => { throw new Error(); }, [middlewareCancel]);
      const result = chain(testInput);

      return Promise.race([
        result.then(() => { throw new Error('Should not resolve.'); }),
        new Promise((res) => { setTimeout(() => { res(); }, 20); }),
      ]);
    });

    it('Should return the expected result if canceled but next called again', () => {
      const middlewareCancel = (
        ctx: InterceptionContext,
        next: (i: Input) => Promise<Output>) => {

        next(ctx.data());

        return new Promise((res) => {
          setTimeout(
            () => {
              ctx.cancel();
              res(next(ctx.data()));
            },
            10);
        });
      };

      const chain = builder.build(testAction, [middlewareCancel]);
      const result = chain(testInput);

      return expect(result).eventually.equals(testOutput);
    });
  });

  describe('Use case: multiple middleware', () => {
    it('Should return a function', () => {
      const chain = builder.build(testAction, [interceptor1, interceptor2]);
      expect(chain).is.instanceOf(Function);
    });

    it('Should return the expected result', () => {
      const chain = builder.build(testAction, [interceptor1, interceptor2]);
      const result = chain(testInput);

      return expect(result).eventually.equals(testOutput);
    });

    it('Should reject on throwing action', () => {
      const action = (input: Input) => { throw new Error('test'); };
      const chain = builder.build(action, [interceptor1, interceptor2]);
      return expect(chain(testInput)).eventually.to.be.rejectedWith('test');
    });

    it('Should reject on rejected action', () => {
      const action = (input: Input) => Promise.reject(new Error('test'));
      const chain = builder.build(action, [interceptor1, interceptor2]);
      return expect(chain(testInput)).eventually.to.be.rejectedWith('test');
    });

    it('Should reject on throwing middleware', () => {
      const chain = builder.build(testAction, [interceptor1, throwingInterceptor]);
      const result = chain(testInput);

      return expect(result).eventually.to.be.rejectedWith('test');
    });

    it('Should reject on rejected middleware', () => {
      const chain = builder.build(testAction, [interceptor1, rejectingInterceptor]);
      const result = chain(testInput);

      return expect(result).eventually.to.be.rejectedWith('test');
    });

    it('Should call action on chain call', () => {
      const action = spy(testAction);
      const chain = builder.build(action, [interceptor1, interceptor2]);
      return chain(testInput).then(() => {
        expect(action.args[0][0].data()).equals(testInput);
        expect(action.calledOnce).is.true;
      });
    });

    it('Should call all middlewares on chain call', () => {
      const mw1 = spy(interceptor1);
      const mw2 = spy(interceptor2);
      const chain = builder.build(testAction, [mw1, mw2]);
      return chain(testInput).then(() => {
        expect(mw1.calledOnce).to.be.true;
        expect(mw1.args[0][0].data()).equals(testInput);
        expect(mw2.calledOnce).to.be.true;
        expect(mw2.args[0][0].data()).equals(testInput);
      });
    });

    it('Should propagate input if changed', () => {
      const overridenInput = new Input();
      const interceptor = (
        ctx: InterceptionContext,
        next: (i: Input) => Promise<Output>) => {

        return next(overridenInput);
      };

      const mw1 = spy(interceptor);
      const mw2 = spy(interceptor1);
      const action = spy(testAction);

      const chain = builder.build(action, [mw1, mw2]);
      return chain(testInput).then(() => {
        expect(mw1.args[0][0].data()).equals(testInput);
        expect(mw2.args[0][0].data()).equals(overridenInput);
        expect(action.args[0][0].data()).equals(overridenInput);
      });
    });

    it('Should not call next interceptors if current rejects', () => {
      const action = spy(testAction);
      const spy1 = spy(interceptor1);
      const spy2 = spy(interceptor2);

      const chain = builder.build(action, [rejectingInterceptor, spy1, spy2]);
      const result = chain(testInput);

      expect(spy1.notCalled).to.be.true;
      expect(spy2.notCalled).to.be.true;
      expect(action.notCalled).to.be.true;
      return expect(result).eventually.to.be.rejectedWith('test');
    });

    it('Should not call next interceptors if current throws', () => {
      const action = spy(testAction);
      const spy1 = spy(interceptor1);
      const spy2 = spy(interceptor2);

      const chain = builder.build(action, [throwingInterceptor, spy1, spy2]);
      const result = chain(testInput);

      expect(spy1.notCalled).to.be.true;
      expect(spy2.notCalled).to.be.true;
      expect(action.notCalled).to.be.true;
      return expect(result).eventually.to.be.rejectedWith('test');
    });

    it('Should call ctx.onCancel in the chain if interceptor cancels', () => {
      const cancelInterceptor = (
        ctx: InterceptionContext,
        next: (i: Input) => Promise<Output>) => {

        next(ctx.data());
        ctx.cancel();
        return Promise.resolve(new Output());
      };

      const isCanceled = [false, false, false];
      const interceptor1 = (
        ctx: InterceptionContext,
        next: (i: Input) => Promise<Output>) => {
        ctx.onCancel(() => isCanceled[0] = true);
        return next(ctx.data());
      };
      const interceptor2 = (
        ctx: InterceptionContext,
        next: (i: Input) => Promise<Output>) => {
        ctx.onCancel(() => isCanceled[1] = true);
        return next(ctx.data());
      };
      const action = (ctx: InterceptionContext) => {
        ctx.onCancel(() => isCanceled[2] = true);
        return Promise.resolve(testOutput);
      };

      const chain = builder.build(action, [cancelInterceptor, interceptor1, interceptor2]);
      const result = chain(testInput);

      expect(isCanceled[0], 'first interceptor canceled').to.be.true;
      expect(isCanceled[1], 'second interceptor canceled').to.be.true;
      expect(isCanceled[2], 'action canceled').to.be.true;
    });
  });
});
