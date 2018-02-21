import { SenderInterceptor, Request, Response, Decorator } from '../../../lib';
import { expect } from 'chai';

describe('Decorator', () => {
  class ClassA { }

  class InterceptorA implements SenderInterceptor {
    submit(
      request: Request,
      next: (request: Request) => Promise<Response>,
    ): Promise<Response> {
      return next(request);
    }
  }

  class InterceptorB implements SenderInterceptor {
    submit(
      request: Request,
      next: (request: Request) => Promise<Response>,
    ): Promise<Response> {
      return next(request);
    }
  }

  const decoratorA = Decorator(() => new InterceptorA());
  const decoratorB = Decorator(() => new InterceptorB());

  describe('@Decorator', () => {
    it('Creates a function', () => {
      const decorator = Decorator(() => new InterceptorA());
      expect(decorator).is.instanceOf(Function);
    });

    it('When decorator is applied: verifies instance', () => {
      const decorator = Decorator(() => new InterceptorA());

      @decorator
      class A { }

      expect(new A()).is.instanceOf(A);
    });

    it('When decorator is applied: verifies interceptor', () => {
      const decorator = Decorator(() => new InterceptorA());

      @decorator
      class A { }

      expect(Decorator.get(A).length).equals(1);
      expect(Decorator.get(A)[0]).is.instanceOf(InterceptorA);
    });

    it('When same decorator is applied twice: verifies interceptors', () => {
      const decorator = Decorator(() => new InterceptorA());

      @decorator
      @decorator
      class A { }

      expect(Decorator.get(A).length).equals(2);
      expect(Decorator.get(A)[0]).not.equals(Decorator.get(A)[1]);
    });

    it('When decorator is applied on several classes: invokes factory each time', () => {
      const decorator = Decorator(() => new InterceptorA());

      @decorator
      class A { }

      @decorator
      class B { }

      expect(Decorator.get(A)[0]).not.equals(Decorator.get(B)[0]);
    });

    it('When several decorator are applied: verifies order', () => {
      const decorator1 = Decorator(() => new InterceptorA());
      const decorator2 = Decorator(() => new InterceptorB());

      @decorator1
      @decorator2
      class A { }

      expect(Decorator.get(A).length).equals(2);
      expect(Decorator.get(A)[0]).is.instanceOf(InterceptorA);
      expect(Decorator.get(A)[1]).is.instanceOf(InterceptorB);
    });
  });

  describe('get', () => {
    it('When is undefined argument: returns empty array', () => {
      expect(Decorator.get(undefined)).to.be.not.null;
      expect(Decorator.get(undefined).length).equals(0);
    });

    it('When is null argument: returns empty array', () => {
      expect(Decorator.get(null)).to.be.not.null;
      expect(Decorator.get(null).length).equals(0);
    });

    it('When no decorator is set: returns empty array', () => {
      expect(Decorator.get(ClassA)).to.be.not.null;
      expect(Decorator.get(ClassA).length).equals(0);
    });

    it('When invoked: returns array copy each time', () => {
      @decoratorA
      class A { }

      expect(Decorator.get(A)).to.not.equal(expect(Decorator.get(A)));
    });

    it('When get from instance: returns decorator', () => {
      @decoratorA
      class A { }

      const result = Decorator.get(new A());
      expect(result).to.be.not.null;
      expect(result.length).equals(1);
      expect(result[0]).is.instanceOf(InterceptorA);
    });
  });

  describe('asInterceptor', () => {
    it('When is already an interceptor: returns same object', () => {
      const interceptor = new InterceptorA();
      expect(Decorator.asInterceptor(interceptor)).equals(interceptor);
    });

    it('When is a decorator: returns interceptor', () => {
      const decorator = Decorator(() => new InterceptorA());
      expect(Decorator.asInterceptor(decorator)).is.instanceOf(InterceptorA);
    });

    it('When is a decorator: returns new interceptor on each instance', () => {
      const decorator = Decorator(() => new InterceptorA());
      const value1 = Decorator.asInterceptor(decorator);
      const value2 = Decorator.asInterceptor(decorator);

      expect(value1).not.equals(value2);
    });
  });
});
