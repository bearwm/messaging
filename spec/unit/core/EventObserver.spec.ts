import { expect } from 'chai';
import { spy, createStubInstance, SinonStubbedInstance, SinonSpy } from 'sinon';
import { Request, RequestResolver } from '../../../lib';
import EventObserver from '../../../lib/core/EventObserver';
import EventRegistry from '../../../lib/core/EventRegistry';

describe('EventObserver', () => {
  let listener: SinonSpy;
  let registryStub: SinonStubbedInstance<EventRegistry>;
  let observer: EventObserver;

  beforeEach(() => {
    listener = spy(() => Promise.resolve());
    registryStub = createStubInstance<EventRegistry>(EventRegistry);
    registryStub.get.returns(listener);

    observer = new EventObserver('test', <any>registryStub);
  });

  describe('ctor', () => {
    it('Should succeed without registry argument.', () => {
      expect(() => new EventObserver('test')).to.not.throw();
    });
  });

  describe('onMessage', () => {
    it('When listener is undefined: throws.', () => {
      expect(() => observer.onMessage(undefined)).to.throw();
    });

    it('Should add listener to registry.', () => {
      observer.onMessage(listener);
      expect(registryStub.add.calledWithExactly('test', listener)).to.be.true;
    });
  });
});

