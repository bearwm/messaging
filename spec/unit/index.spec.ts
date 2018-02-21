import { expect } from 'chai';
import { eventSender, MessageSender, MessageReceiver, eventReceiver } from '../../lib';

describe('eventSender', () => {
  it('Should return an instance of MessageSender', () => {
    expect(eventSender('Test')).to.be.instanceOf(MessageSender);
  });
});

describe('eventReceiver', () => {
  it('Should return an instance of MessageReceiver', () => {
    expect(eventReceiver('Test')).to.be.instanceOf(MessageReceiver);
  });
});
