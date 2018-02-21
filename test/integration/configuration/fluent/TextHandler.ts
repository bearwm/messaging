import { Handler } from '../../../../lib';
import { TextMessage } from './TextMessage';

export class TextHandler implements Handler<TextMessage> {
  handle(message: TextMessage) {
    return `Received: "${message.text}".`;
  }
}
