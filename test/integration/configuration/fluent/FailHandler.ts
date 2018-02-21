import { Handler } from '../../../../lib';
import { FailMessage } from './FailMessage';

export class FailHandler implements Handler<FailMessage> {
  handle(message: FailMessage) {
    throw new Error(message.message);
  }
}
