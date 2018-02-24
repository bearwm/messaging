import {
  eventSender,
  eventReceiver,
  Sender,
  Receiver,
} from '../../lib';

export const sender = eventSender('example-message-decoration');
const receiver = eventReceiver('example-message-decoration');
