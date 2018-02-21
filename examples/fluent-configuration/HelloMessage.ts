import { Message } from '../../lib';

// Use the decorator to mark the message with a custom
// type name and namespace
@Message({ type: 'a-custom-message-name', namespace: 'in-a-custom-namespace' })
export class HelloMessage {
  constructor(public subject: string) { }
}
