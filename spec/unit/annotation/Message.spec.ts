import { Message } from '../../../lib';
import { expect } from 'chai';

describe('Message', () => {
  describe('createDefinition', () => {
    class ATestClass { }

    it('When is constructor function with no options: verifies name', () => {
      const type = Message.createDefinition(ATestClass);
      expect(type.name).equals('ATestClass');
    });

    it('When is constructor function with no options: has undefined namespace', () => {
      const type = Message.createDefinition(ATestClass);
      expect(type.namespace).to.be.undefined;
    });

    it('When is constructor function with given namespace: verifies namespace', () => {
      const type = Message.createDefinition(ATestClass, { namespace: 'test' });
      expect(type.namespace).equals('test');
    });

    it('When is constructor function with given type name: verifies name', () => {
      const type = Message.createDefinition(ATestClass, { type: 'test' });
      expect(type.name).equals('test');
    });

    it('When is constructor function with options: verifies options', () => {
      const options = { type: 'test', namespace: 'ns' };
      const type = Message.createDefinition(ATestClass, options);

      expect(type.name).equals(options.type);
      expect(type.namespace).equals(options.namespace);
    });
  });

  describe('type', () => {
    class SimpleClass { }

    @Message()
    class DefaultClass { }

    @Message({ type: 'TestClass', namespace: 'TestNamespace' })
    class CustomClass { }

    it('When is undefined: returns undefined', () => {
      expect(Message.type(undefined)).to.be.undefined;
    });

    it('When is a non-decorated constructor function: returns constructor name', () => {
      expect(Message.type(SimpleClass).name).equals('SimpleClass');
    });

    it('When is a non-decorated constructor function: returns undefined namespace', () => {
      expect(Message.type(SimpleClass).namespace).to.be.undefined;
    });

    it('When is an object of a non-decorated ctor function: returns constructor name', () => {
      expect(Message.type(new SimpleClass()).name).equals('SimpleClass');
    });

    it('When is an object of a non-decorated ctor function: returns undefined namespace', () => {
      expect(Message.type(new SimpleClass()).namespace).to.be.undefined;
    });

    it('When is a decorated constructor function: verifies constructor name', () => {
      expect(Message.type(DefaultClass).name).equals('DefaultClass');
    });

    it('When is a decorated constructor function: verifies namespace', () => {
      expect(Message.type(DefaultClass).namespace).to.be.undefined;
    });

    it('When is a decorated constructor function with options: verifies constructor name', () => {
      expect(Message.type(CustomClass).name).equals('TestClass');
    });

    it('When is a decorated constructor function with options: verifies namespace', () => {
      expect(Message.type(CustomClass).namespace).equals('TestNamespace');
    });
  });

  describe('@Message', () => {
    @Message()
    @Message()
    class AClass { }

    @Message()
    @Message({ type: 'B' })
    class BClass { }

    it('When is decorated several times: verifies type', () => {
      expect(Message.type(AClass).name).equals('AClass');
    });

    it('When is inherited from base decorated class: verifies', () => {
      @Message({ type: 'test' })
      class A { }
      class B extends A { }

      expect(Message.type(A).name).equals('test');
    });

    it('When is inherited but overrided in derived class: verifies', () => {
      @Message({ type: 'testA' })
      class A { }

      @Message({ type: 'testB' })
      class B extends A { }

      expect(Message.type(B).name).equals('testB');
    });

    it('When is inherited but overrided in derived class: verifies base', () => {
      @Message({ type: 'testA' })
      class A { }

      @Message({ type: 'testB' })
      class B extends A { }

      expect(Message.type(A).name).equals('testA');
    });

    it('When is decorated several times: last definion is used', () => {
      expect(Message.type(BClass).name).equals('B');
    });

    it('When decorator is invoked explicitly: verifies type', () => {
      class A { }

      Message()(A);
      expect(Message.type(A).name).equals('A');
      expect(Message.type(A).namespace).to.be.undefined;
    });

    it('When decorator is invoked explicitly with options: verifies type', () => {
      class A { }

      Message({ type: 'Test', namespace: 'ns' })(A);
      expect(Message.type(A).name).equals('Test');
      expect(Message.type(A).namespace).equals('ns');
    });
  });
});
