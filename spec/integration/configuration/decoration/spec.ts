import { expect } from 'chai';
import { sender } from './setup';
import { TextMessage } from './TextMessage';
import { FailMessage } from './FailMessage';
import { NumberMessage } from './NumberMessage';

describe('Integration/Configuration', () => {
  describe('Test case: configure using @decorators', () => {
    it('Should handle text message', async () => {
      const msg = new TextMessage('Test');
      const result = await sender.submit<TextMessage, string>(msg);

      expect(result).to.equal('Received: "Test".');
    });

    it('Should throw on fail message', async () => {
      const msg = new FailMessage('test error');
      try {
        await sender.submit(msg);
        throw new Error('Failed test: did not throw an error.');
      } catch (err) {
        expect(err.message).to.equal('test error');
      }
    });

    it('Should process all messages submitted concurrently', async () => {
      const msg1 = new TextMessage('First');
      const msg2 = new NumberMessage(42);
      const msg3 = new TextMessage('Last');

      const promises = [
        sender.submit(msg1),
        sender.submit(msg2),
        sender.submit(msg3),
      ];

      const results = await Promise.all(promises);

      expect(results[0]).to.equal('Received: "First".');
      expect(results[1]).to.equal(43);
      expect(results[2]).to.equal('Received: "Last".');
    });
  });
});
