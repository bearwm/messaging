import { Message } from '../../../../lib';

@Message({ type: 'test-text-msg', namespace: 'testing' })
export class TextMessage {
  constructor(public text: string) { }
}
