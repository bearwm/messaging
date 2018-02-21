import { HandlerFor, Handler } from '../../../../lib';
import { NumberMessage } from './NumberMessage';

@HandlerFor(NumberMessage)
export class NumberHandler implements Handler<NumberMessage> {
  handle(message: NumberMessage) {
    return message.value + 1;
  }
}
