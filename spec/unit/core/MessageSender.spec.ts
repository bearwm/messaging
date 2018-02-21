import { expect } from 'chai';
import { spy, createStubInstance, SinonStubbedInstance, match } from 'sinon';

import {
  MessageSender,
  Dispatcher,
  EventDispatcher,
  SenderInterceptor,
  Request,
  Response,
  InterceptionContext,
  Decorator,
  SenderConfigurator,
  InterceptedType,
  MessageType,
  ObjectType,
  Message,
} from '../../../lib';
import { ChainRegistry } from '../../../lib/core/ChainRegistry';
import { ChainBuilder } from '../../../lib/core/ChainBuilder';

describe('MessageSender', () => {
  class TestMessage { }

  class TestInterceptor implements SenderInterceptor {
    submit(
      request: Request,
      next: (request: Request) => Promise<Response>,
      context: InterceptionContext<Request>): Promise<Response> {

      return next(request);
    }
  }

  class TestConfigurator implements SenderConfigurator {
    build(): Map<ObjectType, MessageType> {
      throw new Error('Method not implemented.');
    }

  }

  const testDecorator = Decorator(() => new TestInterceptor());

  let dispatcherStub: SinonStubbedInstance<Dispatcher>;
  let registryStub: SinonStubbedInstance<ChainRegistry>;
  let builderStub: SinonStubbedInstance<ChainBuilder>;

  let dispatcher: Dispatcher;
  let registry: ChainRegistry;
  let builder: ChainBuilder;

  beforeEach(() => {
    dispatcherStub = createStubInstance(EventDispatcher);
    registryStub = createStubInstance(ChainRegistry);
    builderStub = createStubInstance(ChainBuilder);

    dispatcherStub.dispatch.returns(Promise.resolve({}));
    registryStub.get.returns(spy(() => Promise.resolve({})));
    builderStub.build.returns(spy(() => Promise.resolve({})));

    dispatcher = <any>dispatcherStub;
    registry = <any>registryStub;
    builder = <any>builderStub;
  });

  describe('Ctor', () => {
    it('Should create instance with defaults', () => {
      expect(() => new MessageSender(dispatcher)).to.not.throw();
    });

    it('Should create instance with custom services', () => {
      expect(() => new MessageSender(dispatcher, registry, builder)).to.not.throw();
    });

    it('When dispatcher is null: throws', () => {
      expect(() => new MessageSender(undefined)).to.throw('Null dispatcher.');
    });

    it('When registry is null: throws', () => {
      expect(() => new MessageSender(dispatcher, null, builderStub)).to.throw('Null registry.');
    });

    it('When builder is null: throws', () => {
      expect(() => new MessageSender(dispatcher, registry, null)).to.throw('Null builder.');
    });

    it('Should register a factory in registry', () => {
      const sender = new MessageSender(dispatcher, registry);
      expect(registryStub.registerFactory.called).to.be.true;
    });
  });

  describe('interceptAll', () => {
    it('Should clear the registry', () => {
      const sender = new MessageSender(dispatcher, registry);
      sender.interceptAll(new TestInterceptor());

      expect(registryStub.clear.callCount).to.equal(1);
    });

    it('Should be able to add a decorator', () => {
      const sender = new MessageSender(dispatcher, registry);
      expect(() => sender.interceptAll(testDecorator)).to.not.throw();
    });

    it('When submit should include all interceptors', () => {
      const sender = new MessageSender(dispatcher, undefined, builder);
      sender.interceptAll(new TestInterceptor());
      sender.interceptAll(testDecorator);

      sender.submit(new TestMessage());

      expect(builderStub.build.calledWith(
        match.any,
        match(value => value.length === 2)),
      ).to.be.true;
    });

    it('When submit should include all interceptors added in one call', () => {
      const sender = new MessageSender(dispatcher, undefined, builder);
      sender.interceptAll(new TestInterceptor(), new TestInterceptor(), new TestInterceptor());

      sender.submit(new TestMessage());

      expect(builderStub.build.calledWith(
        match.any,
        match(value => value.length === 3)),
      ).to.be.true;
    });
  });

  describe('configure', () => {
    it('Should build the provided configuration', () => {
      const sender = new MessageSender(dispatcher);
      const stub = createStubInstance<SenderConfigurator>(TestConfigurator);
      stub.build.returns(new Map());

      sender.configure(stub);

      expect(stub.build.callCount).to.equal(1);
    });

    it('Should be able to add a null configuration', () => {
      const sender = new MessageSender(dispatcher);

      const stubFactory = (name: string) => {
        class Test { }

        const stub = createStubInstance<SenderConfigurator>(TestConfigurator);
        const map = new Map();
        map.set(Test, name ? {
          name,
          namespace: null,
          interceptors: [],
        } : null);
        stub.build.returns(map);

        return stub;
      };

      sender.configure(stubFactory('test1'));
      sender.configure(stubFactory(null));
    });

    it('Should be able to add an empty configuration', () => {
      const sender = new MessageSender(dispatcher);

      const stubFactory = (name: string) => {
        class Test { }

        const stub = createStubInstance<SenderConfigurator>(TestConfigurator);
        const map = new Map();
        map.set(Test, name ? {
          name,
          namespace: null,
          interceptors: [],
        } : {});
        stub.build.returns(map);

        return stub;
      };

      sender.configure(stubFactory('test1'));
      sender.configure(stubFactory(null));
    });

    it('Shouldbe able to configure multiple', () => {
      const sender = new MessageSender(dispatcher);

      const stubFactory = (name: string) => {
        class Test { }

        const stub = createStubInstance<SenderConfigurator>(TestConfigurator);
        const map = new Map();
        map.set(Test, {
          name,
          namespace: null,
          interceptors: [],
        });
        stub.build.returns(map);

        return stub;
      };

      sender.configure(stubFactory('test1'));
      sender.configure(stubFactory('test2'));
    });

    it('Should merge name for same message type', () => {
      const sender = new MessageSender(dispatcher);
      class Test { }

      const stubFactory = (name: string) => {
        const stub = createStubInstance<SenderConfigurator>(TestConfigurator);
        const map = new Map();
        map.set(Test, {
          name,
          namespace: null,
          interceptors: [],
        });
        stub.build.returns(map);

        return stub;
      };

      sender.configure(stubFactory('test1'));
      sender.configure(stubFactory('test2'));

      sender.submit(new Test());

      expect(dispatcherStub.dispatch
        .calledWith(match((value: Request<Test>) => value.type.name === 'test2')),
      ).to.be.true;
    });

    it('Should merge namespace for same message type', () => {
      const sender = new MessageSender(dispatcher);
      class Test { }

      const stubFactory = (namespace: string) => {
        const stub = createStubInstance<SenderConfigurator>(TestConfigurator);
        const map = new Map();
        map.set(Test, {
          namespace,
          name: 'test',
          interceptors: [],
        });
        stub.build.returns(map);

        return stub;
      };

      sender.configure(stubFactory('test1'));
      sender.configure(stubFactory('test2'));

      sender.submit(new Test());

      expect(dispatcherStub.dispatch
        .calledWith(match((value: Request<Test>) => value.type.namespace === 'test2')),
      ).to.be.true;
    });

    it('Should concat interceptors for same message type', () => {
      const sender = new MessageSender(dispatcher, undefined, builderStub);
      class Test { }

      const stubFactory = (interceptor: SenderInterceptor) => {
        const stub = createStubInstance<SenderConfigurator>(TestConfigurator);
        const map = new Map();
        map.set(Test, {
          name: 'test',
          namespace: null,
          interceptors: [interceptor],
        });
        stub.build.returns(map);

        return stub;
      };

      sender.configure(stubFactory(new TestInterceptor()));
      sender.configure(stubFactory(new TestInterceptor()));

      sender.submit(new Test());

      expect(builderStub.build
        .calledWith(match.any, match((value: {}[]) => value.length === 2)),
      ).to.be.true;
    });
  });

  describe('submit', () => {
    it('When message is null: throws', () => {
      const sender = new MessageSender(dispatcher);
      expect(() => sender.submit(null)).to.throw('Null message.');
    });

    it('Should get chain from registry', () => {
      const sender = new MessageSender(dispatcher, registry);
      sender.submit(new TestMessage());

      expect(registryStub.get.calledWith(TestMessage)).to.be.true;
    });

    it('Should set an id on the request', () => {
      const sender = new MessageSender(dispatcher);
      sender.submit(new TestMessage());

      expect(dispatcherStub.dispatch
        .calledWith(match((value: Request<TestMessage>) => value.id)),
      ).to.be.true;
    });

    it('Should set the message on the request', () => {
      const sender = new MessageSender(dispatcher);
      const msg = new TestMessage();
      sender.submit(msg);

      expect(dispatcherStub.dispatch
        .calledWith(match((value: Request<TestMessage>) => value.data === msg)),
      ).to.be.true;
    });

    it('Should set the type on the request', () => {
      const sender = new MessageSender(dispatcher);
      const msg = new TestMessage();
      sender.submit(msg);

      expect(dispatcherStub.dispatch
        .calledWith(match((value: Request<TestMessage>) => value.type.name === 'TestMessage')),
      ).to.be.true;
    });

    it('Should set a headers object on the request', () => {
      const sender = new MessageSender(dispatcher);
      const msg = new TestMessage();
      sender.submit(msg);

      expect(dispatcherStub.dispatch
        .calledWith(match((value: Request<TestMessage>) => value.headers)),
      ).to.be.true;
    });

    it('Should unwrap the result', () => {
      const sender = new MessageSender(dispatcher, registry);
      const msg = new TestMessage();
      const result = {};

      registryStub.get.reset();
      registryStub.get.returns(spy(() => Promise.resolve({ data: result })));

      return expect(sender.submit(msg))
        .eventually
        .to.equal(result);
    });

    it('Should reject the error response', () => {
      const sender = new MessageSender(dispatcher, registry);
      const msg = new TestMessage();

      registryStub.get.reset();
      registryStub.get.returns(spy(() => Promise.resolve({ error: new Error('test') })));

      return expect(sender.submit(msg))
        .eventually
        .to.be.rejectedWith('test');
    });
  });
});
