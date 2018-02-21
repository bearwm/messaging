import { Throw, eventSender, Configurator, Delay, eventReceiver } from '../../../lib';
import { sender } from './setup';
import { expect } from 'chai';
import { NumberMessage } from './NumberMessage';
import { Return } from '../../../lib/interception/return';

describe('Integration/interception', () => {
  describe('@delay', () => {
    @Delay(30)
    @Return(42)
    class Test { }

    it('Should return the result after decorated delay', async () => {
      const timestamp = Date.now();
      const result = await sender.submit(new Test());
      const delta = Date.now() - timestamp;

      expect(delta).to.be.greaterThan(29);
    });

    it('Should return the result after configured delay', async () => {
      const sender = eventSender('test-interception-2');
      eventReceiver('test-interception-2');

      const config = Configurator.sender()
        .message(NumberMessage)
        .intercept(Delay(30), Return(42));

      sender.configure(config);

      const timestamp = Date.now();
      const result = await sender.submit(new NumberMessage(1));
      const delta = Date.now() - timestamp;

      expect(delta).to.be.greaterThan(29);
    });
  });
});
