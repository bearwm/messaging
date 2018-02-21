import { expect } from 'chai';
import { Return, eventSender, eventReceiver, Configurator } from '../../../lib';
import { sender } from './setup';
import { NumberMessage } from './NumberMessage';

describe('Integration/interception', () => {
  describe('@return', () => {
    @Return(42)
    class Test { }

    it('Should return the decorated value', async () => {
      const result = await sender.submit(new Test());
      expect(result).equals(42);
    });

    it('Should return the configured value', async () => {
      const sender = eventSender('test-interception-1');

      const config = Configurator.sender()
        .message(NumberMessage)
        .intercept(Return(42));

      sender.configure(config);

      const result = await sender.submit(new NumberMessage(0));
      expect(result).equals(42);
    });
  });
});
