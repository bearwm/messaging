import {
  eventSender,
  eventReceiver,
  Sender,
  Receiver,
} from '../../lib';

// Create an instance of a sender that can be exported 
// and used to submit messages
export const sender = eventSender('example-message-decoration');

// Create an instance of a receiver that will listen,
// handle and answer to messaged received from sender
const receiver = eventReceiver('example-message-decoration');
