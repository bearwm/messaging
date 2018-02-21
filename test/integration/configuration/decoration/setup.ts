import {
  eventSender,
  eventReceiver,
  Configurator,
  Sender,
  Receiver,
} from '../../../../lib';

import { TextHandler } from './TextHandler';
import { NumberHandler } from './NumberHandler';
import { FailHandler } from './FailHandler';


export const sender = eventSender('test-defaults');
export const receiver = eventReceiver('test-defaults');

const config = Configurator.receiver()
  .handler(TextHandler, () => new TextHandler())
  .handler(NumberHandler, () => new NumberHandler())
  .handler(FailHandler, () => new FailHandler());

receiver.configure(config);
