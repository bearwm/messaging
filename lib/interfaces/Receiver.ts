import ReceiverConfigurator from './ReceiverConfigurator';
import ReceiverInterceptor from './ReceiverInterceptor';
import { HandlerDecorator } from './types';

export default interface Receiver {
  configure(configurator: ReceiverConfigurator): this;

  interceptAll(interceptor: ReceiverInterceptor, ...interceptors: ReceiverInterceptor[]): this;
  interceptAll(decorator: HandlerDecorator, ...decorators: HandlerDecorator[]): this;
}
