import { eventSender, Configurator, Retry, eventReceiver } from '../../../lib';
import { sender } from './setup';
import { expect } from 'chai';
import { NumberMessage } from './NumberMessage';
import { Return } from '../../../lib/interception/return';
import MessagingError from '../../../lib/core/MessagingError';
import 'mocha';

describe('Integration/interception', () => {
  describe('@timeout', () => {
    @Retry(3)
    class Test { }

    class Test2 { }

    class Handler {
      private n: number = 0;
      handle(msg: Test) {
        this.n += 2;
        if (this.n < 2) throw new Error();

        return 42;
      }
    }

    it('Should return the result on decorated retry', async () => {
      const sender = eventSender('test-interception-3');
      const config = Configurator.receiver()
        .message(Test).handleWith(new Handler());
      const receiver = eventReceiver('test-interception-3');
      receiver.configure(config);

      const result = await sender.submit(new Test());
      expect(result).equals(42);
    });

    it('Should return the result on configured retry', async () => {
      const sender = eventSender('test-interception-4');
      const config = Configurator.receiver()
        .interceptAll(Retry(3))
        .message(Test2).handleWith(new Handler());
      const receiver = eventReceiver('test-interception-4');
      receiver.configure(config);

      const result = await sender.submit(new Test2());
      expect(result).equals(42);
    });
  });
});
