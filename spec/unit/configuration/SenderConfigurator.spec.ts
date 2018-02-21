import { expect } from 'chai';
import {
  Configurator as SenderConfigurator,
} from '../../../lib/configuration/SenderConfigurator';
import {
  SenderInterceptor,
  Message,
  Request,
  Response,
  InterceptionContext,
  Decorator,
  Type,
} from '../../../lib/index';

describe('SenderConfigurator', () => {
  class ClassA { }
  class ClassB { }

  class InterceptorA implements SenderInterceptor {
    submit(
      request: Request<any>,
      next: (request: Request<any>) => Promise<Response<any>>,
      context: InterceptionContext<Request<any>>,
    ): Promise<Response<any>> {
      return next(request);
    }
  }

  class InterceptorB implements SenderInterceptor {
    submit(
      request: Request<any>,
      next: (request: Request<any>) => Promise<Response<any>>,
      context: InterceptionContext<Request<any>>,
    ): Promise<Response<any>> {
      return next(request);
    }
  }

  class InterceptorC implements SenderInterceptor {
    submit(
      request: Request<any>,
      next: (request: Request<any>) => Promise<Response<any>>,
      context: InterceptionContext<Request<any>>,
    ): Promise<Response<any>> {
      return next(request);
    }
  }

  const decoratorA = Decorator(() => new InterceptorA());
  const decoratorB = Decorator(() => new InterceptorB());

  let config: SenderConfigurator;
  beforeEach(() => {
    config = new SenderConfigurator();
  });

  describe('namespace', () => {
    it('When argument is undefined: skips namespace', () => {
      const map = config.namespace(undefined).message(ClassA).build();
      expect(map.get(ClassA).namespace).to.be.undefined;
    });

    it('When namespace provided: verifies namespace', () => {
      const map = config.namespace('ns').message(ClassA).build();
      expect(map.get(ClassA).namespace).equals('ns');
    });

    it('When namespace configured after message: verifies namespace', () => {
      const map = config.message(ClassA).namespace('ns').build();
      expect(map.get(ClassA).namespace).equals('ns');
    });

    it('When namespace configured twice: uses latest value', () => {
      const map = config.message(ClassA).namespace('ns').namespace('ns1').build();
      expect(map.get(ClassA).namespace).equals('ns1');
    });

    it('When namespace configured and message configured: uses message', () => {
      const map = config.message(ClassA, { namespace: 'ns1' }).namespace('ns').build();
      expect(map.get(ClassA).namespace).equals('ns1');
    });

    it('When namespace configured and message configured by decorator: uses message', () => {
      @Message({ namespace: 'ns.A' })
      class A { }

      const map = config.message(A).namespace('ns').build();
      expect(map.get(A).namespace).equals('ns.A');
    });

    it('When namespace configured and several messages: verifies namespace', () => {
      const map = config.message(ClassA).namespace('ns').message(ClassB).build();
      expect(map.get(ClassA).namespace).equals('ns');
      expect(map.get(ClassB).namespace).equals('ns');
    });

    it('When namespace configured and several configured messages: verifies namespace', () => {
      const map = config.message(ClassA, { namespace: 'ns1' })
        .namespace('ns').message(ClassB).build();
      expect(map.get(ClassA).namespace).equals('ns1');
      expect(map.get(ClassB).namespace).equals('ns');
    });

    it('When namespace decorated and configured and set on message: verifies', () => {
      @Message({ namespace: 'A' })
      class Test { }

      const map = config
        .namespace('B')
        .message(Test, { namespace: 'C' })
        .build();
      expect(map.get(Test).namespace).equals('C');
    });

    it('When namespace decorated and configured: verifies', () => {
      @Message({ namespace: 'A' })
      class Test { }

      const map = config
        .namespace('B')
        .message(Test)
        .build();
      expect(map.get(Test).namespace).equals('A');
    });
  });

  describe('message', () => {
    it('When used: is added to map', () => {
      const map = config.message(ClassA).build();
      expect(map.size).equals(1);
      expect(map.get(ClassA)).is.not.null;
    });

    it('When duplicated: last entry is used', () => {
      const map = config
        .message(ClassA, { namespace: 'ns1' })
        .message(ClassA, { namespace: 'ns2' })
        .build();
      expect(map.size).equals(1);
      expect(map.get(ClassA).namespace).equals('ns2');
    });

    it('When used without options: has default type name', () => {
      const map = config.message(ClassA).build();
      expect(map.get(ClassA).name).equals(Message.createDefinition(ClassA).name);
    });

    it('When used without options: has default type namespace', () => {
      const map = config.message(ClassA).build();
      expect(map.get(ClassA).namespace).equals(Message.createDefinition(ClassA).namespace);
    });

    it('When has custom type name: verifies name', () => {
      const map = config.message(ClassA, { type: 'class-a' }).build();
      expect(map.get(ClassA).name).equals('class-a');
    });

    it('When has custom namespace: verifies namespace', () => {
      const map = config.message(ClassA, { namespace: 'ns' }).build();
      expect(map.get(ClassA).namespace).equals('ns');
    });

    it('When separately sets type and namespace: verifies', () => {
      const map = config
        .message(ClassA, { type: 'A' })
        .message(ClassA, { namespace: 'ns' })
        .build();
      expect(map.get(ClassA).name).equals('A');
      expect(map.get(ClassA).namespace).equals('ns');
    });

    it('When used without opions for a decorated type: uses decorated values', () => {
      @Message({ namespace: 'test' })
      class Test { }

      const map = config.message(Test).build();
      expect(map.get(Test).namespace).equals('test');
    });

    it('When used with options for a decorated type: uses options values', () => {
      @Message({ namespace: 'test', type: 'T' })
      class Test { }

      const map = config.message(Test, { namespace: 'ns1', type: 'Tt' }).build();
      expect(map.get(Test).name).equals('Tt');
      expect(map.get(Test).namespace).equals('ns1');
    });

    it('When used partially with options for a decorated type: uses options values', () => {
      @Message({ namespace: 'test' })
      class Test { }

      const map = config.message(Test, { type: 'Tt' }).build();
      expect(map.get(Test).name).equals('Tt');
      expect(map.get(Test).namespace).equals('test');
    });
  });

  describe('interceptAll', () => {
    it('When interceptor set: included in config', () => {
      const interceptor = new InterceptorA();
      const map = config.interceptAll(interceptor).message(ClassA).build();

      expect(map.get(ClassA).interceptors.length).equals(1);
      expect(map.get(ClassA).interceptors[0]).equals(interceptor);
    });

    it('When multiple interceptors set: included in config', () => {
      const map = config
        .message(ClassA)
        .interceptAll(new InterceptorA(), new InterceptorB())
        .build();

      expect(map.get(ClassA).interceptors.length).equals(2);
      expect(map.get(ClassA).interceptors[0]).is.instanceOf(InterceptorA);
      expect(map.get(ClassA).interceptors[1]).is.instanceOf(InterceptorB);
    });

    it('When multiple interceptors set as decorators: included in config', () => {
      const map = config
        .message(ClassA)
        .interceptAll(decoratorA, decoratorB)
        .build();

      expect(map.get(ClassA).interceptors.length).equals(2);
      expect(map.get(ClassA).interceptors[0]).is.instanceOf(InterceptorA);
      expect(map.get(ClassA).interceptors[1]).is.instanceOf(InterceptorB);
    });

    it('When interceptor set after message configured: included in config', () => {
      const interceptor = new InterceptorA();
      const map = config.message(ClassA).interceptAll(interceptor).build();

      expect(map.get(ClassA).interceptors.length).equals(1);
      expect(map.get(ClassA).interceptors[0]).equals(interceptor);
    });

    it('When interceptor set twice: included twice in config', () => {
      const interceptor = new InterceptorA();
      const map = config
        .interceptAll(interceptor)
        .message(ClassA)
        .interceptAll(interceptor)
        .build();

      expect(map.get(ClassA).interceptors.length).equals(2);
    });

    it('When several interceptors set: order is respected', () => {
      const interceptorA = new InterceptorA();
      const interceptorB = new InterceptorB();
      const map = config
        .interceptAll(interceptorA)
        .interceptAll(interceptorB)
        .message(ClassA)
        .build();

      expect(map.get(ClassA).interceptors.length).equals(2);
      expect(map.get(ClassA).interceptors[0]).equals(interceptorA);
      expect(map.get(ClassA).interceptors[1]).equals(interceptorB);
    });

    it('When interceptors set for a message with custom interceptor: order is respected', () => {
      const interceptorA = new InterceptorA();
      const interceptorB = new InterceptorB();
      const map = config
        .message(ClassA).intercept(interceptorB)
        .interceptAll(interceptorA)
        .build();

      expect(map.get(ClassA).interceptors.length).equals(2);
      expect(map.get(ClassA).interceptors[0]).equals(interceptorA);
      expect(map.get(ClassA).interceptors[1]).equals(interceptorB);
    });

    it('When interceptor set with multiple mssages: included in all messages', () => {
      const interceptor = new InterceptorA();
      const map = config
        .interceptAll(interceptor)
        .message(ClassA)
        .message(ClassB)
        .build();

      expect(map.get(ClassA).interceptors.length).equals(1);
      expect(map.get(ClassA).interceptors[0]).equals(interceptor);

      expect(map.get(ClassB).interceptors.length).equals(1);
      expect(map.get(ClassB).interceptors[0]).equals(interceptor);
    });

    it('When interceptor set from decorator: included in config', () => {
      const map = config.interceptAll(decoratorA).message(ClassA).build();

      expect(map.get(ClassA).interceptors.length).equals(1);
      expect(map.get(ClassA).interceptors[0]).is.instanceOf(InterceptorA);
    });

    it('When interceptors added in different ways: verifies order', () => {
      class Test { }

      const map = config
        .interceptAll(new InterceptorB())
        .message(Test).intercept(new InterceptorC())
        .build();

      expect(map.get(Test).interceptors.length).equals(2);
      expect(map.get(Test).interceptors[0]).is.instanceOf(InterceptorB);
      expect(map.get(Test).interceptors[1]).is.instanceOf(InterceptorC);
    });
  });

  describe('intercept', () => {
    it('When interceptor set: included in config', () => {
      const interceptor = new InterceptorA();
      const map = config.message(ClassA).intercept(interceptor).build();

      expect(map.get(ClassA).interceptors.length).equals(1);
      expect(map.get(ClassA).interceptors[0]).equals(interceptor);
    });

    it('When multiple interceptors set: included in config', () => {
      const map = config
        .message(ClassA)
        .intercept(new InterceptorA(), new InterceptorB())
        .build();

      expect(map.get(ClassA).interceptors.length).equals(2);
      expect(map.get(ClassA).interceptors[0]).is.instanceOf(InterceptorA);
      expect(map.get(ClassA).interceptors[1]).is.instanceOf(InterceptorB);
    });

    it('When multiple interceptors set as decorators: included in config', () => {
      const map = config
        .message(ClassA)
        .intercept(decoratorA, decoratorB)
        .build();

      expect(map.get(ClassA).interceptors.length).equals(2);
      expect(map.get(ClassA).interceptors[0]).is.instanceOf(InterceptorA);
      expect(map.get(ClassA).interceptors[1]).is.instanceOf(InterceptorB);
    });

    it('When interceptor set twice: included twice in config', () => {
      const interceptor = new InterceptorA();
      const map = config
        .message(ClassA)
        .intercept(interceptor)
        .intercept(interceptor)
        .build();

      expect(map.get(ClassA).interceptors.length).equals(2);
    });

    it('When several interceptors set: order is respected', () => {
      const interceptorA = new InterceptorA();
      const interceptorB = new InterceptorB();
      const map = config
        .message(ClassA)
        .intercept(interceptorA)
        .intercept(interceptorB)
        .build();

      expect(map.get(ClassA).interceptors.length).equals(2);
      expect(map.get(ClassA).interceptors[0]).equals(interceptorA);
      expect(map.get(ClassA).interceptors[1]).equals(interceptorB);
    });

    it('When set for one message: not included in other messages', () => {
      const interceptorA = new InterceptorA();
      const map = config
        .message(ClassA)
        .intercept(interceptorA)
        .message(ClassB)
        .build();

      expect(map.get(ClassB).interceptors.length).equals(0);
    });
  });

  describe('build', () => {
    it('When nothing configured: returns empty map', () => {
      const map = config.build();
      expect(map.size).to.equal(0);
    });

    it('When invoked: creates new map instance each time', () => {
      expect(config.build()).to.not.equal(config.build());
    });
  });
});
