import AbstractConfigurator from './AbstractConfigurator';
import {
  Type,
  ObjectType,
  MessageDecorator,
  MessageType,
  SenderInterceptor,
  SenderConfigurator,
} from '../interfaces';

export interface FluentConfigurator extends SenderConfigurator {
  /**
   * Defines a default namespace for all message types in this configuration.
   * The default namespace is used only for message types that
   * don't define a custom namespace.
   * @argument ns namespace
   */
  namespace(ns: string): FluentConfigurator;

  /**
   * Configures a message. Options can be specified to override defaults.
   * @argument constructor constructor function
   * @argument options defines a custom type name and namespace
   */
  message<TMessage>(
    constructor: ObjectType<TMessage>,
    options?: { type?: string, namespace?: string }):
    FluentConfigurator & MessageConfigurator<TMessage>;

  /**
   * Defines a list of interceptors for all message types in this configuration.
   * @argument interceptor sender interceptor instance
   * @argument interceptors additional interceptors 
   */
  interceptAll(interceptor: SenderInterceptor, ...interceptors: SenderInterceptor[]):
    FluentConfigurator;

  /**
   * Defines a list of interceptors given their corresponding decorators 
   * for all message types in this configuration.
   * @argument decorator message decorator
   * @argument decorators additional decorators 
   */
  interceptAll(decorator: MessageDecorator, ...decorators: MessageDecorator[]):
    FluentConfigurator;
}

export interface MessageConfigurator<TMessage> {
  /**
   * Defines a list of interceptors for current message type in this configuration.
   * @argument interceptor sender interceptor instance
   * @argument interceptors additional interceptors 
   */
  intercept<TResult>(
    interceptor: SenderInterceptor<TMessage, TResult>,
    ...interceptors: SenderInterceptor<TMessage, TResult>[]):
    MessageConfigurator<TMessage> & FluentConfigurator;

  /**
   * Defines a list of interceptors given their corresponding decorators 
   * for current message type in this configuration.
   * @argument decorator message decorator
   * @argument decorators additional decorators 
   */
  intercept<TResult>(
    decorator: MessageDecorator, ...decorators: MessageDecorator[]):
    MessageConfigurator<TMessage> & FluentConfigurator;
}

export class Configurator
  extends AbstractConfigurator<MessageType, SenderInterceptor, MessageDecorator>
  implements FluentConfigurator, MessageConfigurator<any> {

  protected createEntry(messageType: Type): MessageType {
    return <MessageType>{
      name: messageType.name,
      namespace: messageType.namespace,
      interceptors: [],
    };
  }

  protected copyEntry(config: MessageType): MessageType {
    return <MessageType>{
      name: config.name,
      namespace: config.namespace,
      interceptors: config.interceptors,
    };
  }
}
