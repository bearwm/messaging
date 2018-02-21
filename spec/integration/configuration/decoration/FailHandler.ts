import { HandlerFor, Handler } from '../../../../lib';
import { FailMessage } from './FailMessage';

@HandlerFor(FailMessage)
export class FailHandler implements Handler<FailMessage> {
  handle(message: FailMessage) {
    throw new Error(message.message);
  }
}
