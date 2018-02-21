import {
  eventSender,
  eventReceiver,
  Configurator,
  Sender,
  Receiver,
} from '../../../lib';

import { NumberHandler } from './NumberHandler';
import { NumberMessage } from './NumberMessage';


export const sender = eventSender('test-fluent');
export const receiver = eventReceiver('test-fluent');

const senderConfig = Configurator.sender()
  .namespace('default-ns')
  .message(NumberMessage);
sender.configure(senderConfig);

const receiverConfig = Configurator.receiver()
  .namespace('default-ns')
  .message(NumberMessage).handleWith(() => new NumberHandler());
receiver.configure(receiverConfig);
