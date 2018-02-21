import { MessageDecorator } from './types';
import SenderConfigurator from './SenderConfigurator';
import SenderInterceptor from './SenderInterceptor';

export default interface Sender {
  submit<TMessage, TResult>(message: TMessage): Promise<TResult>;

  configure(configurator: SenderConfigurator): this;

  interceptAll(interceptor: SenderInterceptor, ...interceptors: SenderInterceptor[]): this;
  interceptAll(decorator: MessageDecorator, ...decorators: MessageDecorator[]): this;
}
