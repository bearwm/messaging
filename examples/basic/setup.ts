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
export const sender = eventSender('example-basic');

// Create an instance of a receiver that will listen,
// handle and answer to messaged received from sender
const receiver = eventReceiver('example-basic');

// Create a receiver configuration.
// The configuration serves as a rule for how to handle messages.
const config = Configurator.receiver()
  // register messages of type HelloMessage 
  // to be handled with a specific handler created by a factory method
  .message(HelloMessage)
  .handleWith(() => new HelloHandler);

// configure the receiver
receiver.configure(config);
