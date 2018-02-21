import { Handler, HandlerFor } from '../../../../lib';
import { TextMessage } from './TextMessage';

@HandlerFor(TextMessage)
export class TextHandler implements Handler<TextMessage> {
  handle(message: TextMessage) {
    return `Received: "${message.text}".`;
  }
}
