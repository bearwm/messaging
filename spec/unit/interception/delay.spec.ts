import { expect } from 'chai';
import { spy } from 'sinon';
import { DelayInterceptor, Request, Delay, Decorator } from '../../../lib';

describe('DelayInterceptor', () => {
  let request: Request;

  beforeEach(() => {
    request = { id: 'labs42', data: {}, type: null, headers: {} };
  });

  describe('@Return', () => {
    it('Should apply decorator', () => {
      @Delay(10)
      class Test { }

      expect(Decorator.get(Test)[0]).to.be.instanceOf(DelayInterceptor);
    });
  });

  describe('handle', () => {
    it('Should continue with given request', () => {
      const target = new DelayInterceptor(10);
      const next = spy();
      return target.handle(request, next).then(() => {
        expect(next.calledWith(request)).to.be.true;
      });
    });

    it('Should continue after given delay', () => {
      const delay = 30;
      const target = new DelayInterceptor(delay);
      const timestamp = Date.now();

      return target.handle(request, spy()).then(() => {
        expect(Date.now() - timestamp).to.be.greaterThan(delay - 1);
      });
    });
  });

  describe('submit', () => {
    it('Should continue with given request', () => {
      const target = new DelayInterceptor(10);
      const next = spy();
      return target.submit(request, next).then(() => {
        expect(next.calledWith(request)).to.be.true;
      });
    });

    it('Should continue after given delay', () => {
      const delay = 30;
      const target = new DelayInterceptor(delay);
      const timestamp = Date.now();

      return target.submit(request, spy()).then(() => {
        expect(Date.now() - timestamp).to.be.greaterThan(delay - 1);
      });
    });
  });
});
