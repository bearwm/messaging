import { Throw, eventSender, Configurator, Delay, Timeout } from '../../../lib';
import { sender } from './setup';
import { expect } from 'chai';
import { NumberMessage } from './NumberMessage';
import { Return } from '../../../lib/interception/return';
import MessagingError from '../../../lib/core/MessagingError';

describe('Integration/interception', () => {
  describe('@timeout', () => {
    @Timeout(30)
    @Delay(35)
    @Return(42)
    class Test { }

    it('Should be rejected after decorated timeout', () => {
      return expect(sender.submit(new Test()))
        .eventually
        .to.be.rejectedWith(MessagingError)
        .that.has.property('reason')
        .that.equals('timeout');
    });

    it('Should be rejected after configured timeout', () => {
      const sender = eventSender('test-interception-2');

      const config = Configurator.sender()
        .message(NumberMessage)
        .intercept(Timeout(30), Delay(35));

      sender.configure(config);

      return expect(sender.submit(new NumberMessage(1)))
        .eventually
        .to.be.rejectedWith(MessagingError)
        .that.has.property('reason')
        .that.equals('timeout');
    });
  });
});
