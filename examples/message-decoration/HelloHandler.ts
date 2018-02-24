import { Handler, HandlerFor } from '../../lib';
import { HelloMessage } from './HelloMessage';

// Use the HandlerFor decorator to specify that
// current handler can handle messages of type `HelloMessage`
@HandlerFor(HelloMessage)
export class HelloHandler implements Handler<HelloMessage>{
  handle(request: HelloMessage) {
    return `Hello ${request.subject}`;
  }
}
