import {
  eventSender,
  eventReceiver,
  Configurator,
  Sender,
  Receiver,
} from '../../lib';

import { HelloMessage } from './HelloMessage';
import { HelloHandler } from './HelloHandler';


// Create an instance of a sender that can be exported 
// and used to submit messages
export const sender = eventSender('example-message-decoration');

// Create an instance of a receiver that will listen,
// handle and answer to messaged received from sender
const receiver = eventReceiver('example-message-decoration');

// Create a receiver configuration.
// The configuration serves as a rule for how to handle messages.
const config = Configurator.receiver()
  // register the HelloHandler type and factory method;
  .handler(HelloHandler, () => new HelloHandler);

// configure the receiver
receiver.configure(config);
