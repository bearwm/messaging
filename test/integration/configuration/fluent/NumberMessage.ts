import { Message } from '../../../../lib';

@Message({ namespace: 'test' })
export class NumberMessage {
  constructor(public value: number) { }
}
