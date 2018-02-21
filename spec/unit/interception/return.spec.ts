import { expect } from 'chai';
import { spy } from 'sinon';
import { ReturnInterceptor, Request, Return, Decorator } from '../../../lib';

describe('ReturnInterceptor', () => {
  let request: Request;

  beforeEach(() => {
    request = { id: 'labs42', data: {}, type: null, headers: {} };
  });

  describe('@Return', () => {
    it('Should apply decorator', () => {
      @Return(42)
      class Test { }

      expect(Decorator.get(Test)[0]).to.be.instanceOf(ReturnInterceptor);
    });
  });

  describe('handle', () => {
    it('Should return the result', () => {
      const result = 42;
      const target = new ReturnInterceptor(result);
      return expect(target.handle(request, spy()))
        .eventually
        .to.have.property('data')
        .that.equal(result);
    });

    it('Should not call next', () => {
      const result = 42;
      const target = new ReturnInterceptor(result);
      const next = spy();

      return target.handle(request, next).then(() => {
        expect(next.notCalled).to.be.true;
      });
    });
  });

  describe('submit', () => {
    it('Should return the result', () => {
      const result = 42;
      const target = new ReturnInterceptor(result);
      return expect(target.submit(request, spy()))
        .eventually
        .to.have.property('data')
        .that.equal(result);
    });

    it('Should not call next', () => {
      const result = 42;
      const target = new ReturnInterceptor(result);
      const next = spy();

      return target.submit(request, next).then(() => {
        expect(next.notCalled).to.be.true;
      });
    });
  });
});
