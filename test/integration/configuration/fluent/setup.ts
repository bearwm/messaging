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
import { TextMessage } from './TextMessage';
import { NumberMessage } from './NumberMessage';
import { FailMessage } from './FailMessage';
import { AliasTextMessage } from './AliasTextMessage';

export const sender = eventSender('test-interception');
export const receiver = eventReceiver('test-interception');

const senderConfig = Configurator.sender()
  .namespace('default-ns')
  .message(TextMessage, { namespace: 'testing', type: 'test-text-message' })
  .message(NumberMessage, { namespace: 'fluent-test' });
sender.configure(senderConfig);

const receiverConfig = Configurator.receiver()
  .namespace('default-ns')
  .message(AliasTextMessage, { namespace: 'testing', type: 'test-text-message' })
  .handleWith(() => new TextHandler())

  .message(NumberMessage, { namespace: 'fluent-test' })
  .handleWith(() => new NumberHandler())

  .message(FailMessage, { namespace: null })
  .handleWith(() => new FailHandler());

receiver.configure(receiverConfig);
