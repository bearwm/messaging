import { expect } from 'chai';
import { HandlerFor, Handler } from '../../../lib';

describe('HandlerFor', () => {
  class MessageA { }
  class MessageB { }

  describe('messages', () => {
    it('When is undefined: returns empty array', () => {
      expect(HandlerFor.messages(undefined)).to.be.not.undefined;
      expect(HandlerFor.messages(undefined))
        .to.have.property('length')
        .that.equals(0);
    });

    it('When class not decorated: returns empty array', () => {
      class A { }
      expect(HandlerFor.messages(A)).to.be.not.undefined;
      expect(HandlerFor.messages(A))
        .to.have.property('length')
        .that.equals(0);
    });

    it('When object of a not decorated class: returns empty array', () => {
      class A { }

      const obj = new A();
      expect(HandlerFor.messages(obj)).to.be.not.undefined;
      expect(HandlerFor.messages(obj))
        .to.have.property('length')
        .that.equals(0);
    });
  });

  describe('@HandlerFor', () => {
    it('When is decorated: verifies', () => {
      @HandlerFor(MessageA)
      class A implements Handler<MessageA> {
        handle(message: MessageA) { }
      }

      const result = HandlerFor.messages(A);
      expect(result)
        .to.have.property('length')
        .that.equals(1);

      expect(result[0]).equals(MessageA);
    });

    it('When is invoked explicitly: verifies', () => {
      class A implements Handler<MessageA> {
        handle(message: MessageA) { }
      }

      HandlerFor(MessageA)(A);

      const result = HandlerFor.messages(A);
      expect(result)
        .to.have.property('length')
        .that.equals(1);

      expect(result[0]).equals(MessageA);
    });

    it('When is decorated multiple times: verifies all added', () => {
      @HandlerFor(MessageA)
      @HandlerFor(MessageB)
      class A implements Handler<any> {
        handle(message: any) { }
      }

      const result = HandlerFor.messages(A);
      expect(result)
        .to.have.property('length')
        .that.equals(2);
    });

    it('When is decorated multiple times: verifies order', () => {
      @HandlerFor(MessageA)
      @HandlerFor(MessageB)
      class A implements Handler<any> {
        handle(message: any) { }
      }

      const result = HandlerFor.messages(A);
      expect(result[0]).equals(MessageA);
      expect(result[1]).equals(MessageB);
    });

    it('When base class is decorated: verifies', () => {
      @HandlerFor(MessageA)
      class A implements Handler<any> {
        handle(message: any) { }
      }

      class B extends A { }

      const result = HandlerFor.messages(B);
      expect(result)
        .to.have.property('length')
        .that.equals(1);
      expect(result[0]).equals(MessageA);
    });

    it('When base class and derived class are decorated: verifies order', () => {
      @HandlerFor(MessageA)
      class A implements Handler<any> {
        handle(message: any) { }
      }

      @HandlerFor(MessageB)
      class B extends A { }

      const result = HandlerFor.messages(B);
      expect(result)
        .to.have.property('length')
        .that.equals(2);
      expect(result[0]).equals(MessageB);
      expect(result[1]).equals(MessageA);
    });
  });
});
