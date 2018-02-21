import { expect } from 'chai';
import { spy } from 'sinon';
import EventRegistry from '../../../lib/core/EventRegistry';

describe('EventRegistry', () => {
  describe('instance', () => {
    it('Should be defined', () => {
      expect(EventRegistry.instance).to.be.instanceof(EventRegistry);
    });

    it('Should be singleton instance', () => {
      expect(EventRegistry.instance).to.equal(EventRegistry.instance);
    });
  });

  describe('add', () => {
    let registry: EventRegistry;
    beforeEach(() => { registry = new EventRegistry(); });

    it('When event name is duplicated: throws.', () => {
      registry.add('test', spy());
      expect(() => registry.add('test', spy())).to.throw();
    });

    it('When event name added: can be retreived.', () => {
      const listener = spy();
      registry.add('test', listener);

      expect(registry.get('test')).to.equal(listener);
    });
  });

  describe('get', () => {
    let registry: EventRegistry;
    beforeEach(() => { registry = new EventRegistry(); });

    it('When event name has no listener: throws.', () => {
      expect(() => registry.get('test')).to.throw();
    });

    it('When event name has listener: succeeds.', () => {
      registry.add('test', spy());
      expect(() => registry.get('test')).to.not.throw();
    });
  });
});
