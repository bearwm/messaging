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
export const sender = eventSender('example-fluent-configuration');

const senderConfig = Configurator.sender()
  .message(HelloMessage, { type: 'hello-msg', namespace: 'demo-namespace' });

// Create a sender configuration.
// The configuration serves is used to identity message types.
sender.configure(senderConfig);

// Create an instance of a receiver that will listen,
// handle and answer to messaged received from sender
const receiver = eventReceiver('example-fluent-configuration');

// Create a receiver configuration.
// The configuration serves as a rule for how to handle messages.
const config = Configurator.receiver()
  // The type/namespace tuple serves as a message type identifier
  // and should be the same in sender and receivers configs for 
  // correspoding messages
  .message(HelloMessage, { type: 'hello-msg', namespace: 'demo-namespace' })
  // register a handler factory method for `HelloMessage` types
  .handleWith(() => new HelloHandler);

// configure the receiver
receiver.configure(config);
