import { expect } from 'chai';
import { spy } from 'sinon';
import { ThrowInterceptor, Request, Throw, Decorator } from '../../../lib';

describe('ThrowInterceptor', () => {
  let request: Request;

  beforeEach(() => {
    request = { id: 'labs42', data: {}, type: null, headers: {} };
  });

  describe('@Throw', () => {
    it('Should apply decorator', () => {
      @Throw(new Error('test'))
      class Test { }

      expect(Decorator.get(Test)[0]).to.be.instanceOf(ThrowInterceptor);
    });
  });

  describe('handle', () => {
    it('Should reject with error', () => {
      const error = new Error('42');
      const target = new ThrowInterceptor(error);
      return expect(target.handle(request, spy()))
        .eventually
        .to.be.rejectedWith('42');
    });

    it('Should not call next', () => {
      const error = new Error('42');
      const target = new ThrowInterceptor(error);
      const next = spy();

      return target.handle(request, next).catch(() => {
        expect(next.notCalled).to.be.true;
      });
    });
  });

  describe('submit', () => {
    it('Should reject with result', () => {
      const error = new Error('42');
      const target = new ThrowInterceptor(error);
      return expect(target.submit(request, spy()))
        .eventually
        .to.be.rejectedWith('42');
    });

    it('Should not call next', () => {
      const error = new Error('42');
      const target = new ThrowInterceptor(error);
      const next = spy();

      return target.submit(request, next).catch(() => {
        expect(next.notCalled).to.be.true;
      });
    });
  });
});
