import { Message } from '../../../../lib';

@Message()
export class FailMessage {
  constructor(public message: string) { }
}
