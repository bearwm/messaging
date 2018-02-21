import { expect } from 'chai';
import { spy, createStubInstance, SinonStubbedInstance, match } from 'sinon';

import {
  MessageSender,
  Dispatcher,
  ReceiverInterceptor,
  Request,
  Response,
  InterceptionContext,
  Decorator,
  ReceiverConfigurator,
  InterceptedType,
  MessageType,
  ObjectType,
  Message,
  HandledMessageType,
  Observer,
  Handler,
  MessagingError,
} from '../../../lib';
import { ChainRegistry } from '../../../lib/core/ChainRegistry';
import { ChainBuilder } from '../../../lib/core/ChainBuilder';
import EventObserver from '../../../lib/core/EventObserver';
import MessageReceiver from '../../../lib/core/MessageReceiver';

describe('MessageReceiver', () => {
  class TestMessage { }
  class TestHandler implements Handler {
    handle(message: any) {
      throw new Error('Not implemented.');
    }
  }

  class TestInterceptor implements ReceiverInterceptor {
    handle(
      request: Request,
      next: (request: Request) => Promise<Response>,
      context: InterceptionContext<Request>): Promise<Response> {

      return next(request);
    }
  }

  class TestConfigurator implements ReceiverConfigurator {
    build(): Map<ObjectType, HandledMessageType> {
      throw new Error('Not implemented.');
    }

  }

  const testDecorator = Decorator(() => new TestInterceptor());

  let observerStub: SinonStubbedInstance<Observer>;
  let registryStub: SinonStubbedInstance<ChainRegistry>;
  let builderStub: SinonStubbedInstance<ChainBuilder>;
  let testConfigurator: ReceiverConfigurator;
  let testHandler: TestHandler;

  let observer: Observer;
  let registry: ChainRegistry;
  let builder: ChainBuilder;

  let send: (req: Request) => void;

  beforeEach(() => {
    observerStub = createStubInstance(EventObserver);
    registryStub = createStubInstance(ChainRegistry);
    builderStub = createStubInstance(ChainBuilder);

    registryStub.get.returns(spy(() => Promise.resolve({})));
    builderStub.build.returns(spy(() => Promise.resolve({})));

    observer = <any>observerStub;
    registry = <any>registryStub;
    builder = <any>builderStub;

    testHandler = new TestHandler();
    const map = new Map();
    map.set(TestMessage, {
      name: 'TestMessage',
      handler: testHandler,
      interceptors: [],
    });
    const confStub = createStubInstance<ReceiverConfigurator>(TestConfigurator);
    confStub.build.returns(map);
    testConfigurator = confStub;

    send = req => observerStub.onMessage.args[0][0](req);
  });

  describe('Ctor', () => {
    it('Should create instance with defaults', () => {
      expect(() => new MessageReceiver(observer)).to.not.throw();
    });

    it('Should create instance with custom services', () => {
      expect(() => new MessageReceiver(observer, registry, builder)).to.not.throw();
    });

    it('When observer is null: throws', () => {
      expect(() => new MessageReceiver(undefined)).to.throw('Null observer.');
    });

    it('When registry is null: throws', () => {
      expect(() => new MessageReceiver(observer, null, builderStub)).to.throw('Null registry.');
    });

    it('When builder is null: throws', () => {
      expect(() => new MessageReceiver(observer, registry, null)).to.throw('Null builder.');
    });

    it('Should register a factory in registry', () => {
      const target = new MessageReceiver(observer, registry);
      expect(registryStub.registerFactory.called).to.be.true;
    });

    it('Should subscribe observer', () => {
      const target = new MessageReceiver(observer, registry);
      expect(observerStub.onMessage.called).to.be.true;
    });
  });

  describe('interceptAll', () => {
    it('Should clear the registry', () => {
      const target = new MessageReceiver(observer, registry);
      target.interceptAll(new TestInterceptor());

      expect(registryStub.clear.callCount).to.equal(1);
    });

    it('Should be able to add a decorator', () => {
      const target = new MessageReceiver(observer, registry);
      expect(() => target.interceptAll(testDecorator)).to.not.throw();
    });

    it('When receiving should include all interceptors', () => {
      const target = new MessageReceiver(observer, undefined, builder);
      target.interceptAll(new TestInterceptor());
      target.interceptAll(testDecorator);
      target.configure(testConfigurator);

      send(<Request>{
        id: '1',
        data: new TestMessage(),
        headers: {},
        type: { name: 'TestMessage' },
      });

      expect(builderStub.build.calledWith(
        match.any,
        match(value => value.length === 2)),
      ).to.be.true;
    });

    it('When receiving should include all interceptors added in one call', () => {
      const target = new MessageReceiver(observer, undefined, builder);
      target
        .interceptAll(new TestInterceptor(), new TestInterceptor(), new TestInterceptor())
        .configure(testConfigurator);

      send(<Request>{
        id: '1',
        data: new TestMessage(),
        headers: {},
        type: { name: 'TestMessage' },
      });

      expect(builderStub.build.calledWith(
        match.any,
        match(value => value.length === 3)),
      ).to.be.true;
    });
  });

  describe('configure', () => {
    it('Should build the provided configuration', () => {
      const target = new MessageReceiver(observer);
      const stub = createStubInstance<ReceiverConfigurator>(TestConfigurator);
      stub.build.returns(new Map());

      target.configure(stub);

      expect(stub.build.callCount).to.equal(1);
    });

    it('Should be able to add a null configuration', () => {
      const target = new MessageReceiver(observer);

      const stubFactory = (name: string) => {
        class Test { }

        const stub = createStubInstance<ReceiverConfigurator>(TestConfigurator);
        const map = new Map();
        map.set(Test, name ? {
          name,
          namespace: null,
          interceptors: [],
        } : null);
        stub.build.returns(map);

        return stub;
      };

      target.configure(stubFactory('test1'));
      target.configure(stubFactory(null));
    });

    it('Should be able to add an empty configuration', () => {
      const target = new MessageReceiver(observer);

      const stubFactory = (name: string) => {
        class Test { }

        const stub = createStubInstance<ReceiverConfigurator>(TestConfigurator);
        const map = new Map();
        map.set(Test, name ? {
          name,
          namespace: null,
          interceptors: [],
        } : {});
        stub.build.returns(map);

        return stub;
      };

      target.configure(stubFactory('test1'));
      target.configure(stubFactory(null));
    });

    it('Shouldbe able to configure multiple', () => {
      const target = new MessageReceiver(observer);

      const stubFactory = (name: string) => {
        class Test { }

        const stub = createStubInstance<ReceiverConfigurator>(TestConfigurator);
        const map = new Map();
        map.set(Test, {
          name,
          namespace: null,
          interceptors: [],
        });
        stub.build.returns(map);

        return stub;
      };

      target.configure(stubFactory('test1'));
      target.configure(stubFactory('test2'));
    });

    it('Should merge name for same message type', () => {
      const target = new MessageReceiver(observer);
      class Test { }

      const stubFactory = (name: string) => {
        const stub = createStubInstance<ReceiverConfigurator>(TestConfigurator);
        const map = new Map();
        map.set(Test, {
          name,
          namespace: null,
          interceptors: [],
        });
        stub.build.returns(map);

        return stub;
      };

      target.configure(stubFactory('test1'));
      target.configure(stubFactory('test2'));

      expect(() => {
        send(<Request>{
          id: '1',
          data: new TestMessage(),
          headers: {},
          type: { name: 'test2' },
        });
      }).to.not.throw();
    });

    it('Should merge namespace for same message type', () => {
      const target = new MessageReceiver(observer);
      class Test { }

      const stubFactory = (namespace: string) => {
        const stub = createStubInstance<ReceiverConfigurator>(TestConfigurator);
        const map = new Map();
        map.set(Test, {
          namespace,
          name: 'test',
          interceptors: [],
          handler: new TestHandler(),
        });
        stub.build.returns(map);

        return stub;
      };

      target.configure(stubFactory('test1'));
      target.configure(stubFactory('test2'));

      expect(() => {
        send(<Request>{
          id: '1',
          data: new Test(),
          headers: {},
          type: { name: 'test', namespace: 'test2' },
        });
      }).to.not.throw();
    });

    it('Should concat interceptors for same message type', () => {
      const target = new MessageReceiver(observer, undefined, builderStub);
      class Test { }

      const stubFactory = (interceptor: ReceiverInterceptor) => {
        const stub = createStubInstance<ReceiverConfigurator>(TestConfigurator);
        const map = new Map();
        map.set(Test, {
          name: 'test',
          namespace: null,
          interceptors: [interceptor],
          handler: new TestHandler(),
        });
        stub.build.returns(map);

        return stub;
      };

      target.configure(stubFactory(new TestInterceptor()));
      target.configure(stubFactory(new TestInterceptor()));

      send(<Request>{
        id: '1',
        data: new Test(),
        headers: {},
        type: { name: 'test' },
      });

      expect(builderStub.build
        .calledWith(match.any, match((value: {}[]) => value.length === 2)),
      ).to.be.true;
    });
  });

  describe(':receive', () => {
    it('When message is null: rejects', () => {
      const target = new MessageReceiver(observer);

      expect(send(null))
        .eventually
        .to.be.rejectedWith('Received a null request.');
    });

    it('When has no handler registered: rejects', () => {
      const target = new MessageReceiver(observer);

      return expect(
        send(<Request>{
          id: '1',
          data: new TestMessage(),
          headers: {},
          type: { name: 'TestMessage' },
        }))
        .eventually
        .to.be.have.property('error')
        .that.is.instanceOf(MessagingError);
    });

    it('Should set the prototype property of the request message', () => {
      const target = new MessageReceiver(observer);
      target.configure(testConfigurator);

      const request = <Request>{
        id: '1',
        data: {},
        headers: {},
        type: { name: 'TestMessage' },
      };

      send(request);

      expect(request.data.prototype.constructor).to.equal(TestMessage);
    });

    it('Should get chain from registry', () => {
      const target = new MessageReceiver(observer, registry);
      target.configure(testConfigurator);

      send(<Request>{
        id: '1',
        data: new TestMessage(),
        headers: {},
        type: { name: 'TestMessage' },
      });

      expect(registryStub.get.calledWith(TestMessage)).to.be.true;
    });

    it('When handler rejects should wrap error', () => {
      const target = new MessageReceiver(observer);
      testHandler.handle = () => Promise.reject(new Error('test'));
      target.configure(testConfigurator);

      const request = <Request>{
        id: '1',
        data: {},
        headers: {},
        type: { name: 'TestMessage' },
      };

      return expect(send(request))
        .eventually
        .to.have.property('error')
        .that.has.property('message')
        .that.equals('test');
    });

    it('When handler throws should wrap error', () => {
      const target = new MessageReceiver(observer);
      target.configure(testConfigurator);

      const request = <Request>{
        id: '1',
        data: {},
        headers: {},
        type: { name: 'TestMessage' },
      };

      return expect(send(request))
        .eventually
        .to.have.property('error')
        .that.has.property('message')
        .that.equals('Not implemented.');
    });

    it('Should return back same id', () => {
      const target = new MessageReceiver(observer);
      target.configure(testConfigurator);

      const request = <Request>{
        id: 'labs-42',
        data: {},
        headers: {},
        type: { name: 'TestMessage' },
      };

      return expect(send(request))
        .eventually
        .to.have.property('id')
        .that.equal('labs-42');
    });

    it('Should propagate the result', () => {
      const target = new MessageReceiver(observer);
      const result = {};
      testHandler.handle = () => Promise.resolve(result);
      target.configure(testConfigurator);

      const request = <Request>{
        id: '1',
        data: {},
        headers: {},
        type: { name: 'TestMessage' },
      };

      return expect(send(request))
        .eventually
        .to.have.property('data')
        .that.equal(result);
    });
  });
});
