import { Return } from '../../lib';

// Use the `Return` decorator to always
// return the given result when submit this types of messages.
@Return('Hello World')
export class HelloMessage {
  constructor(public subject: string) { }
}
