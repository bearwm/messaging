import { Handler } from '../../lib';
import { HelloMessage } from './HelloMessage';

export class HelloHandler implements Handler<HelloMessage>{
  handle(request: HelloMessage) {
    return `Hello ${request.subject}`;
  }
}
