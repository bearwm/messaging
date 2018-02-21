import { Throw, eventSender, Configurator } from '../../../lib';
import { sender } from './setup';
import { expect } from 'chai';
import { NumberMessage } from './NumberMessage';

describe('Integration/interception', () => {
  describe('@throw', () => {
    @Throw(new Error('Not implemented.'))
    class Test { }

    it('Should throw the decorated error', () => {
      return expect(sender.submit(new Test()))
        .eventually
        .to.be.rejectedWith('Not implemented.');
    });

    it('Should throw the configured value', () => {
      const sender = eventSender('test-interception-2');

      const config = Configurator.sender()
        .message(NumberMessage)
        .intercept(Throw(new Error('A test')));

      sender.configure(config);

      return expect(sender.submit(new NumberMessage(1)))
        .eventually
        .to.be.rejectedWith('A test');
    });
  });
});
