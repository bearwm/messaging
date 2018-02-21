import { expect } from 'chai';
import { spy, createStubInstance, SinonStubbedInstance } from 'sinon';
import {
  TimeoutInterceptor,
  Request,
  Timeout,
  Decorator,
  InterceptionContext,
  MessagingError,
} from '../../../lib';

describe('TimeoutInterceptor', () => {
  class FakeContext implements InterceptionContext {
    data() { }
    isCanceled(): boolean { return false; }
    cancel(): void { }
    onCancel(notifier: (context: InterceptionContext<any>) => void): void { }
  }

  let request: Request;
  let context: SinonStubbedInstance<InterceptionContext>;

  beforeEach(() => {
    request = { id: 'labs42', data: {}, type: null, headers: {} };
    context = createStubInstance<InterceptionContext>(FakeContext);
  });

  describe('@Timeout', () => {
    it('Should apply decorator', () => {
      @Timeout(10)
      class Test { }

      expect(Decorator.get(Test)[0]).to.be.instanceOf(TimeoutInterceptor);
    });
  });

  describe('handle', () => {
    it('Should reject with timeout error when time exceeded', () => {
      const target = new TimeoutInterceptor(20);
      const next = spy(() => { return new Promise(() => { }); });
      return expect(target.handle(request, next, context))
        .eventually
        .to.be.rejectedWith(MessagingError)
        .that.has.property('reason')
        .that.equals('timeout');
    });

    it('Should return the result within given timeout', () => {
      const target = new TimeoutInterceptor(20);
      const next = spy(() => Promise.resolve(42));
      return expect(target.handle(request, next, context))
        .eventually
        .to.equal(42);
    });

    it('Should cancel the context when timing out', () => {
      const target = new TimeoutInterceptor(20);
      const next = spy(() => { return new Promise(() => { }); });
      return target.handle(request, next, context)
        .catch(() => {
          expect(context.cancel.calledOnce).to.be.true;
        });
    });
  });

  describe('submit', () => {
    it('Should reject with timeout error when time exceeded', () => {
      const target = new TimeoutInterceptor(20);
      const next = spy(() => { return new Promise(() => { }); });
      return expect(target.submit(request, next, context))
        .eventually
        .to.be.rejectedWith(MessagingError)
        .that.has.property('reason')
        .that.equals('timeout');
    });

    it('Should return the result within given timeout', () => {
      const target = new TimeoutInterceptor(20);
      const next = spy(() => Promise.resolve(42));
      return expect(target.submit(request, next, context))
        .eventually
        .to.equal(42);
    });

    it('Should cancel the context when timing out', () => {
      const target = new TimeoutInterceptor(20);
      const next = spy(() => { return new Promise(() => { }); });
      return target.submit(request, next, context)
        .catch(() => {
          expect(context.cancel.calledOnce).to.be.true;
        });
    });
  });
});
