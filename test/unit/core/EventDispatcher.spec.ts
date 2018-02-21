import { expect } from 'chai';
import { spy, createStubInstance, SinonStubbedInstance, SinonSpy } from 'sinon';
import { Request, RequestResolver } from '../../../lib';
import EventDispatcher from '../../../lib/core/EventDispatcher';
import EventRegistry from '../../../lib/core/EventRegistry';

describe('EventDispatcher', () => {
  let listener: SinonSpy;
  let registryStub: SinonStubbedInstance<EventRegistry>;
  let dispatcher: EventDispatcher;

  beforeEach(() => {
    listener = spy(() => Promise.resolve());
    registryStub = createStubInstance<EventRegistry>(EventRegistry);
    registryStub.get.returns(listener);

    dispatcher = new EventDispatcher('test', <any>registryStub);
  });

  describe('ctor', () => {
    it('Should succeed without registry argument.', () => {
      expect(() => new EventDispatcher('test')).to.not.throw();
    });
  });

  describe('dispatch', () => {
    it('Should get the listener from registry', () => {
      dispatcher.dispatch(<Request>{ id: '1', data: {}, type: {}, headers: {} });
      expect(registryStub.get.callCount).to.equal(1);
    });

    it('Should invoke listener', () => {
      dispatcher.dispatch(<Request>{ id: '1', data: {}, type: {}, headers: {} });
      expect(listener.callCount).to.equal(1);
    });

    it('Should invoke listener with given request', () => {
      const request = <Request>{ id: '1', data: {}, type: {}, headers: {} };
      dispatcher.dispatch(request);
      expect(listener.calledWithExactly(request)).to.be.true;
    });

    it('Should wrap listener rejection', () => {
      listener = spy(() => Promise.reject(new Error('test 42')));
      registryStub = createStubInstance<EventRegistry>(EventRegistry);
      registryStub.get.returns(listener);

      dispatcher = new EventDispatcher('test', <any>registryStub);
      const request = <Request>{ id: '1', data: {}, type: {}, headers: {} };
      return expect(dispatcher.dispatch(request))
        .eventually.to.have.property('error');
    });
  });

  describe('forget', () => {
    it('Should succeed.', () => {
      expect(() => dispatcher.forget(null)).to.not.throw();
    });
  });
});
