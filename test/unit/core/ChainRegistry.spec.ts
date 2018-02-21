import { expect } from 'chai';
import { spy, SinonSpy } from 'sinon';
import { ChainRegistry } from '../../../lib/core/ChainRegistry';
import { ChainBuilder } from '../../../lib/core/ChainBuilder';
import { resolve } from 'dns';

describe('ChainRegistry', () => {
  class Test { }
  let registry: ChainRegistry;

  beforeEach(() => {
    registry = new ChainRegistry();
  });

  describe('registerFactory', () => {
    it('Should return self.', () => {
      expect(registry.registerFactory(spy())).to.equal(registry);
    });

    it('Should allow multiple calls.', () => {
      registry.registerFactory(spy());
      expect(() => registry.registerFactory(spy())).to.not.throw();
    });
  });

  describe('get', () => {
    it('When not created should invoke factory', () => {
      const factory = spy();
      registry.registerFactory(factory);
      registry.get(Test);

      expect(factory.calledWithExactly(Test)).to.be.true;
    });

    it('Should invoke factory only once', () => {
      const factory = spy();
      registry.registerFactory(factory);

      registry.get(Test);
      registry.get(Test);

      expect(factory.callCount).to.equal(1);
    });

    it('Should register factory\'s result', () => {
      const result = {};
      const factory = spy(() => result);
      registry.registerFactory(factory);

      const actual = registry.get(Test);
      expect(actual).to.equal(result);
    });
  });

  describe('clear', () => {
    it('Should succeed when has no entries.', () => {
      expect(() => registry.clear()).to.not.throw();
    });

    it('Should succeed when has entries.', () => {
      registry.registerFactory(spy());
      registry.get(Test);

      expect(() => registry.clear()).to.not.throw();
    });

    it('Should call factory after clear.', () => {
      const factory = spy();
      registry.registerFactory(factory);
      registry.get(Test);

      registry.clear();
      registry.get(Test);

      expect(factory.callCount).to.equal(2);
    });
  });
});
