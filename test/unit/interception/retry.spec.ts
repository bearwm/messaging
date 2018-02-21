import { expect } from 'chai';
import { spy, createStubInstance, SinonStubbedInstance, SinonSpy } from 'sinon';
import {
  RetryInterceptor,
  Request,
  Retry,
  Decorator,
  InterceptionContext,
  MessagingError,
} from '../../../lib';
import { RequestResolver } from '../../../lib/interfaces/types';

describe('RetryInterceptor', () => {
  class FakeContext implements InterceptionContext {
    data() { }
    isCanceled(): boolean { return false; }
    cancel(): void { }
    onCancel(notifier: (context: InterceptionContext<any>) => void): void { }
  }

  let request: Request;
  let next: SinonSpy;
  let context: SinonStubbedInstance<InterceptionContext>;

  beforeEach(() => {
    request = { id: 'labs42', data: {}, type: null, headers: {} };
    next = spy(() => Promise.resolve({ error: new Error('test') }));
    context = createStubInstance<InterceptionContext>(FakeContext);
  });

  describe('@Retry', () => {
    it('Should apply decorator', () => {
      @Retry(3)
      class Test { }

      expect(Decorator.get(Test)[0]).to.be.instanceOf(RetryInterceptor);
    });
  });

  describe('handle', () => {
    it('Should retry `next` given attempts count plus one', () => {
      const attempts = 5;
      const target = new RetryInterceptor(attempts);
      return target.handle(request, next, context)
        .then(() => { throw new Error('Failed test.'); })
        .catch(() => {
          expect(next.callCount).to.equal(attempts + 1);
        });
    });

    it('Should be rejected with last error', () => {
      const target = new RetryInterceptor(5);
      return expect(target.handle(request, next, context))
        .eventually
        .to.have.property('error')
        .that.has.property('message')
        .that.equals('test');
    });

    it('Should cancel context on each retry', () => {
      const attempts = 5;
      const target = new RetryInterceptor(attempts);
      return target.handle(request, next, context)
        .then(() => { throw new Error('Failed test.'); })
        .catch(() => {
          expect(context.cancel.callCount).to.equal(attempts);
        });
    });

    it('Should not retry when error filtered out', () => {
      const target = new RetryInterceptor(5, err => false);
      return target.handle(request, next, context)
        .then(() => { throw new Error('Failed test.'); })
        .catch(() => {
          expect(next.calledOnce).to.be.true;
        });
    });
  });

  describe('submit', () => {
    it('Should retry `next` given attempts count plus one', () => {
      const attempts = 5;
      const target = new RetryInterceptor(attempts);
      return target.submit(request, next, context)
        .then(() => { throw new Error('Failed test.'); })
        .catch(() => {
          expect(next.callCount).to.equal(attempts + 1);
        });
    });

    it('Should be rejected with last error', () => {
      const target = new RetryInterceptor(5);
      return expect(target.submit(request, next, context))
        .eventually
        .to.have.property('error')
        .that.has.property('message')
        .that.equals('test');
    });

    it('Should cancel context on each retry', () => {
      const attempts = 5;
      const target = new RetryInterceptor(attempts);
      return target.submit(request, next, context)
        .then(() => { throw new Error('Failed test.'); })
        .catch(() => {
          expect(context.cancel.callCount).to.equal(attempts);
        });
    });

    it('Should not retry when error filtered out', () => {
      const target = new RetryInterceptor(5, err => false);
      return target.submit(request, next, context)
        .then(() => { throw new Error('Failed test.'); })
        .catch(() => {
          expect(next.calledOnce).to.be.true;
        });
    });
  });
});
