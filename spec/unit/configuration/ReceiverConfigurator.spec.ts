import { expect } from 'chai';
import {
  Configurator as ReceiverConfigurator,
} from '../../../lib/configuration/ReceiverConfigurator';
import {
  ReceiverInterceptor,
  Message,
  HandlerFor,
  Request,
  Response,
  InterceptionContext,
  Decorator,
  Handler,
  Type,
} from '../../../lib/index';

describe('ReceiverConfigurator', () => {
  class MessageA { }
  class MessageB { }

  @HandlerFor(MessageA)
  class HandlerA implements Handler<MessageA> {
    handle(request: MessageA) { }
  }

  class HandlerB implements Handler<MessageB> {
    handle(request: MessageB) { }
  }

  class InterceptorA implements ReceiverInterceptor {
    handle(
      request: Request<any>,
      next: (request: Request<any>) => Promise<Response<any>>,
      context: InterceptionContext<Request<any>>,
    ): Promise<Response<any>> {
      return next(request);
    }
  }

  class InterceptorB implements ReceiverInterceptor {
    handle(
      request: Request<any>,
      next: (request: Request<any>) => Promise<Response<any>>,
      context: InterceptionContext<Request<any>>,
    ): Promise<Response<any>> {
      return next(request);
    }
  }

  class InterceptorC implements ReceiverInterceptor {
    handle(
      request: Request<any>,
      next: (request: Request<any>) => Promise<Response<any>>,
      context: InterceptionContext<Request<any>>,
    ): Promise<Response<any>> {
      return next(request);
    }
  }

  const decoratorA = Decorator(() => new InterceptorA());
  const decoratorB = Decorator(() => new InterceptorB());

  let config: ReceiverConfigurator;
  beforeEach(() => {
    config = new ReceiverConfigurator();
  });

  describe('namespace', () => {
    it('When argument is undefined: skips namespace', () => {
      const map = config.namespace(undefined).message(MessageA).build();
      expect(map.get(MessageA).namespace).to.be.undefined;
    });

    it('When namespace provided: verifies namespace', () => {
      const map = config.namespace('ns').message(MessageA).build();
      expect(map.get(MessageA).namespace).equals('ns');
    });

    it('When namespace configured after message: verifies namespace', () => {
      const map = config.message(MessageA).namespace('ns').build();
      expect(map.get(MessageA).namespace).equals('ns');
    });

    it('When namespace configured after handler: verifies namespace', () => {
      const map = config.handler(HandlerA, new HandlerA()).namespace('ns').build();
      expect(map.get(MessageA).namespace).equals('ns');
    });

    it('When namespace configured twice: uses latest value', () => {
      const map = config.message(MessageA).namespace('ns').namespace('ns1').build();
      expect(map.get(MessageA).namespace).equals('ns1');
    });

    it('When namespace configured and message configured: uses message', () => {
      const map = config.message(MessageA, { namespace: 'ns1' }).namespace('ns').build();
      expect(map.get(MessageA).namespace).equals('ns1');
    });

    it('When namespace configured and message configured by decorator: uses message', () => {
      @Message({ namespace: 'ns.A' })
      class A { }

      const map = config.message(A).namespace('ns').build();
      expect(map.get(A).namespace).equals('ns.A');
    });

    it('When namespace configured and several messages: verifies namespace', () => {
      const map = config.message(MessageA).namespace('ns').message(MessageB).build();
      expect(map.get(MessageA).namespace).equals('ns');
      expect(map.get(MessageB).namespace).equals('ns');
    });

    it('When namespace configured and several configured messages: verifies namespace', () => {
      const map = config.message(MessageA, { namespace: 'ns1' })
        .namespace('ns').message(MessageB).build();
      expect(map.get(MessageA).namespace).equals('ns1');
      expect(map.get(MessageB).namespace).equals('ns');
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
      const map = config.message(MessageA).build();
      expect(map.size).equals(1);
      expect(map.get(MessageA)).is.not.null;
    });

    it('When duplicated: last entry is used', () => {
      const map = config
        .message(MessageA, { namespace: 'ns1' })
        .message(MessageA, { namespace: 'ns2' })
        .build();
      expect(map.size).equals(1);
      expect(map.get(MessageA).namespace).equals('ns2');
    });

    it('When used without options: has default type name', () => {
      const map = config.message(MessageA).build();
      expect(map.get(MessageA).name).equals(Message.createDefinition(MessageA).name);
    });

    it('When used without options: has default type namespace', () => {
      const map = config.message(MessageA).build();
      expect(map.get(MessageA).namespace).equals(Message.createDefinition(MessageA).namespace);
    });

    it('When has custom type name: verifies name', () => {
      const map = config.message(MessageA, { type: 'class-a' }).build();
      expect(map.get(MessageA).name).equals('class-a');
    });

    it('When has custom namespace: verifies namespace', () => {
      const map = config.message(MessageA, { namespace: 'ns' }).build();
      expect(map.get(MessageA).namespace).equals('ns');
    });

    it('When separately sets type and namespace: verifies', () => {
      const map = config
        .message(MessageA, { type: 'A' })
        .message(MessageA, { namespace: 'ns' })
        .build();
      expect(map.get(MessageA).name).equals('A');
      expect(map.get(MessageA).namespace).equals('ns');
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
      const map = config.interceptAll(interceptor).message(MessageA).build();

      expect(map.get(MessageA).interceptors.length).equals(1);
      expect(map.get(MessageA).interceptors[0]).equals(interceptor);
    });

    it('When multiple interceptors set: included in config', () => {
      const map = config
        .message(MessageA)
        .interceptAll(new InterceptorA(), new InterceptorB())
        .build();

      expect(map.get(MessageA).interceptors.length).equals(2);
      expect(map.get(MessageA).interceptors[0]).is.instanceOf(InterceptorA);
      expect(map.get(MessageA).interceptors[1]).is.instanceOf(InterceptorB);
    });

    it('When multiple interceptors set as decorators: included in config', () => {
      const map = config
        .message(MessageA)
        .interceptAll(decoratorA, decoratorB)
        .build();

      expect(map.get(MessageA).interceptors.length).equals(2);
      expect(map.get(MessageA).interceptors[0]).is.instanceOf(InterceptorA);
      expect(map.get(MessageA).interceptors[1]).is.instanceOf(InterceptorB);
    });

    it('When interceptor set after message configured: included in config', () => {
      const interceptor = new InterceptorA();
      const map = config.message(MessageA).interceptAll(interceptor).build();

      expect(map.get(MessageA).interceptors.length).equals(1);
      expect(map.get(MessageA).interceptors[0]).equals(interceptor);
    });

    it('When interceptor set twice: included twice in config', () => {
      const interceptor = new InterceptorA();
      const map = config
        .interceptAll(interceptor)
        .message(MessageA)
        .interceptAll(interceptor)
        .build();

      expect(map.get(MessageA).interceptors.length).equals(2);
    });

    it('When several interceptors set: verifies order', () => {
      const interceptorA = new InterceptorA();
      const interceptorB = new InterceptorB();
      const map = config
        .interceptAll(interceptorA)
        .interceptAll(interceptorB)
        .message(MessageA)
        .build();

      expect(map.get(MessageA).interceptors.length).equals(2);
      expect(map.get(MessageA).interceptors[0]).equals(interceptorA);
      expect(map.get(MessageA).interceptors[1]).equals(interceptorB);
    });

    it('When interceptors set for a message with custom interceptor: verifies order', () => {
      const interceptorA = new InterceptorA();
      const interceptorB = new InterceptorB();
      const map = config
        .message(MessageA).intercept(interceptorB)
        .interceptAll(interceptorA)
        .build();

      expect(map.get(MessageA).interceptors.length).equals(2);
      expect(map.get(MessageA).interceptors[0]).equals(interceptorA);
      expect(map.get(MessageA).interceptors[1]).equals(interceptorB);
    });

    it('When interceptor set with multiple mssages: included in all messages', () => {
      const interceptor = new InterceptorA();
      const map = config
        .interceptAll(interceptor)
        .message(MessageA)
        .message(MessageB)
        .build();

      expect(map.get(MessageA).interceptors.length).equals(1);
      expect(map.get(MessageA).interceptors[0]).equals(interceptor);

      expect(map.get(MessageB).interceptors.length).equals(1);
      expect(map.get(MessageB).interceptors[0]).equals(interceptor);
    });

    it('When interceptor set from decorator: included in config', () => {
      const map = config.interceptAll(decoratorA).message(MessageA).build();

      expect(map.get(MessageA).interceptors.length).equals(1);
      expect(map.get(MessageA).interceptors[0]).is.instanceOf(InterceptorA);
    });

    it('When interceptors added in different ways: verifies order', () => {
      class M { }

      class H implements Handler<M> {
        handle(request: M) { }
      }

      const map = config
        .interceptAll(new InterceptorA())
        .message(M).handleWith(new H()).intercept(new InterceptorB())
        .build();

      expect(map.get(M).interceptors.length).equals(2);
      expect(map.get(M).interceptors[0]).is.instanceOf(InterceptorA);
      expect(map.get(M).interceptors[1]).is.instanceOf(InterceptorB);
    });
  });

  describe('intercept', () => {
    it('When interceptor set: included in config', () => {
      const interceptor = new InterceptorA();
      const map = config.message(MessageA).intercept(interceptor).build();

      expect(map.get(MessageA).interceptors.length).equals(1);
      expect(map.get(MessageA).interceptors[0]).equals(interceptor);
    });

    it('When multiple interceptors set: included in config', () => {
      const map = config
        .message(MessageA)
        .intercept(new InterceptorA(), new InterceptorB())
        .build();

      expect(map.get(MessageA).interceptors.length).equals(2);
      expect(map.get(MessageA).interceptors[0]).is.instanceOf(InterceptorA);
      expect(map.get(MessageA).interceptors[1]).is.instanceOf(InterceptorB);
    });

    it('When multiple interceptors set as decorators: included in config', () => {
      const map = config
        .message(MessageA)
        .intercept(decoratorA, decoratorB)
        .build();

      expect(map.get(MessageA).interceptors.length).equals(2);
      expect(map.get(MessageA).interceptors[0]).is.instanceOf(InterceptorA);
      expect(map.get(MessageA).interceptors[1]).is.instanceOf(InterceptorB);
    });

    it('When interceptor set twice: included twice in config', () => {
      const interceptor = new InterceptorA();
      const map = config
        .message(MessageA)
        .intercept(interceptor)
        .intercept(interceptor)
        .build();

      expect(map.get(MessageA).interceptors.length).equals(2);
    });

    it('When several interceptors set: order is respected', () => {
      const interceptorA = new InterceptorA();
      const interceptorB = new InterceptorB();
      const map = config
        .message(MessageA)
        .intercept(interceptorA)
        .intercept(interceptorB)
        .build();

      expect(map.get(MessageA).interceptors.length).equals(2);
      expect(map.get(MessageA).interceptors[0]).equals(interceptorA);
      expect(map.get(MessageA).interceptors[1]).equals(interceptorB);
    });

    it('When set for one message: not included in other messages', () => {
      const interceptorA = new InterceptorA();
      const map = config
        .message(MessageA)
        .intercept(interceptorA)
        .message(MessageB)
        .build();

      expect(map.get(MessageB).interceptors.length).equals(0);
    });
  });

  describe('handleWith', () => {
    it('When not invoked: has undefined value', () => {
      const map = config
        .message(MessageA)
        .build();

      expect(map.get(MessageA).handler).to.be.undefined;
    });

    it('When set: verifies value', () => {
      const map = config
        .message(MessageA)
        .handleWith(new HandlerA())
        .build();

      expect(map.get(MessageA).handler).is.instanceOf(HandlerA);
    });

    it('When set but several messages configured: verifies value', () => {
      const map = config
        .message(MessageA)
        .message(MessageB)
        .handleWith(new HandlerA())
        .build();

      expect(map.get(MessageA).handler).is.undefined;
    });

    it('When set several times: last value is used', () => {
      const map = config
        .message(MessageA)
        .handleWith(new HandlerA())
        .handleWith(new HandlerB())
        .build();

      expect(map.get(MessageA).handler).is.instanceOf(HandlerB);
    });

    it('When set as factory: verifies value', () => {
      const factory = () => new HandlerA();

      const map = config
        .message(MessageA)
        .handleWith(factory)
        .build();

      expect(map.get(MessageA).handler).equals(factory);
    });
  });

  describe('handle', () => {
    it('When handler not decorated: throws', () => {
      class H implements Handler<any>{
        handle(message: any) { }
      }

      expect(() => config.handler(H, new H())).to.throw;
    });

    it('When handler decorated: verifies', () => {
      @Message({ type: 'TM', namespace: 'ns' })
      class M { }

      @HandlerFor(M)
      class H implements Handler<M>{
        handle(message: M) { }
      }

      const map = config.handler(H, new H()).build();
      const result = map.get(M);
      expect(result).to.not.be.undefined;
      expect(result.name).equals('TM');
      expect(result.namespace).equals('ns');
    });

    it('When handler decorated and message customized: verifies', () => {
      @Message({ type: 'TM', namespace: 'ns' })
      class M { }

      @HandlerFor(M)
      class H implements Handler<M>{
        handle(message: M) { }
      }

      const map = config
        .message(M, { type: 'a', namespace: 'b' })
        .handler(H, new H())
        .build();

      const result = map.get(M);
      expect(result).to.not.be.undefined;
      expect(result.name).equals('a');
      expect(result.namespace).equals('b');
    });

    it('When handler decorated for multiple messages: verifies', () => {
      class M { }
      class N { }

      @HandlerFor(M)
      @HandlerFor(N)
      class H implements Handler<N>{
        handle(message: N) { }
      }

      const map = config.handler(H, new H()).build();
      const result = map.get(M);
      expect(map.get(M)).to.not.be.undefined;
      expect(map.get(N)).to.not.be.undefined;
      expect(map.get(M).name).equals('M');
      expect(map.get(N).name).equals('N');
    });

    it('When handler decorated for multiple messages with interceptor: verifies', () => {
      class M { }
      class N { }

      @HandlerFor(M)
      @HandlerFor(N)
      class H implements Handler<N>{
        handle(message: N) { }
      }

      const map = config.handler(H, new H())
        .intercept(new InterceptorA())
        .build();

      expect(map.get(M).interceptors[0]).to.be.instanceOf(InterceptorA);
      expect(map.get(N).interceptors[0]).to.be.instanceOf(InterceptorA);
    });

    it('When multiple handlers configured: verifies', () => {
      class M { }
      class N { }

      @HandlerFor(M)
      class HM implements Handler<M>{
        handle(message: M) { }
      }

      @HandlerFor(N)
      class HN implements Handler<N>{
        handle(message: N) { }
      }

      const map = config
        .message(MessageA)
        .handler(HM, new HM()).intercept(new InterceptorA())
        .handler(HN, new HN()).intercept(new InterceptorB())
        .build();

      expect(map.get(MessageA).interceptors.length).equals(0);
      expect(map.get(M).interceptors.length).equals(1);
      expect(map.get(M).interceptors[0]).to.be.instanceOf(InterceptorA);
      expect(map.get(N).interceptors.length).equals(1);
      expect(map.get(N).interceptors[0]).to.be.instanceOf(InterceptorB);
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
