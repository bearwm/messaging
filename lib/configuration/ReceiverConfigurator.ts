import AbstractConfigurator from './AbstractConfigurator';
import Decorator from '../annotation/Decorator';
import HandlerFor from '../annotation/HandlerFor';
import {
  ObjectType,
  Factory,
  Type,
  HandlerDecorator,
  HandledMessageType,
  ReceiverInterceptor,
  ReceiverConfigurator,
  Handler,
} from '../interfaces';

export interface FluentConfigurator extends ReceiverConfigurator {

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
  message<TMessage, TResult>(
    constructor: ObjectType<TMessage>,
    options?: { type?: string, namespace?: string }):
    FluentConfigurator & MessageConfigurator<TMessage, TResult>;

  /**
   * Configures a handler decorated with @HandlerFor decorator.
   * Throws an error if the handler is not decorated.
   * @argument handlerCtor handler constructor function
   * @argument factory a factory method to create handler instances
   */
  handler<THandler extends Handler<TMessage, TResult>, TMessage, TResult>(
    handlerCtor: ObjectType<THandler>,
    factory: Factory<THandler>)
    : FluentConfigurator & HandlerConfigurator<TMessage, TResult>;

  /**
   * Configures a handler decorated with @HandlerFor decorator.
   * Throws an error if the handler is not decorated.
   * @argument handlerCtor handler constructor function
   * @argument handler a handler instance used to handle messages
   */
  handler<THandler extends Handler<TMessage, TResult>, TMessage, TResult>(
    handlerCtor: ObjectType<THandler>,
    handler: THandler)
    : FluentConfigurator & HandlerConfigurator<TMessage, TResult>;

  /**
   * Defines a list of interceptors for all message types in this configuration.
   * @argument interceptor receiver interceptor instance
   * @argument interceptors additional interceptors 
   */
  interceptAll(interceptor: ReceiverInterceptor, ...interceptors: ReceiverInterceptor[]):
    FluentConfigurator;

  /**
   * Defines a list of interceptors given their corresponding decorators 
   * for all message types in this configuration.
   * @argument decorator handler decorator
   * @argument decorators additional decorators 
   */
  interceptAll(decorator: HandlerDecorator, ...decorators: HandlerDecorator[]):
    FluentConfigurator;
}

export interface MessageConfigurator<TMessage, TResult> {
  /**
   * Defines a list of interceptors for current message type in this configuration.
   * @argument interceptor receiver interceptor instance
   * @argument interceptors additional interceptors 
   */
  intercept(interceptor: ReceiverInterceptor, ...interceptors: ReceiverInterceptor[]):
    FluentConfigurator & MessageConfigurator<TMessage, TResult>;

  /**
   * Defines a list of interceptors given their corresponding decorators 
   * for current message type in this configuration.
   * @argument decorator handler decorator
   * @argument decorators additional decorators 
   */
  intercept(decorator: HandlerDecorator, ...decorators: HandlerDecorator[]):
    FluentConfigurator & MessageConfigurator<TMessage, TResult>;

  /**
   * Configures a handler instance to be used for current message types.
   * @argument instance message handler instance
   */
  handleWith<THandler extends Handler<TMessage, TResult>>(instance: THandler):
    FluentConfigurator & HandlerConfigurator<TMessage, TResult>;

  /**
   * Configures a handler factory to be used for current message types.
   * @argument instance message handler factory
   */
  handleWith<THandler extends Handler<TMessage, TResult>>(factory: Factory<THandler>):
    FluentConfigurator & HandlerConfigurator<TMessage, TResult>;
}

export interface HandlerConfigurator<TMessage, TResult> {
  /**
   * Defines a list of interceptors for current message type in this configuration.
   * @argument interceptor receiver interceptor instance
   * @argument interceptors additional interceptors 
   */
  intercept(interceptor: ReceiverInterceptor, ...interceptors: ReceiverInterceptor[]):
    FluentConfigurator & HandlerConfigurator<TMessage, TResult>;

  /**
   * Defines a list of interceptors given their corresponding decorators 
   * for current message type in this configuration.
   * @argument decorator handler decorator
   * @argument decorators additional decorators 
   */
  intercept(decorator: HandlerDecorator, ...decorators: HandlerDecorator[]):
    FluentConfigurator & HandlerConfigurator<TMessage, TResult>;
}

export class Configurator
  extends AbstractConfigurator<HandledMessageType, ReceiverInterceptor, HandlerDecorator>
  implements FluentConfigurator,
  MessageConfigurator<any, any>,
  HandlerConfigurator<any, any> {

  handleWith<THandler extends Handler<TMessage, TResult>, TMessage, TResult>
    (factoryOrInstance: THandler | Factory<THandler>): this {

    this.state.forEach((state) => {
      const entry = this.entries.get(state);
      entry.handler = factoryOrInstance;
    });

    return this;
  }

  handler<THandler extends Handler<TMessage, TResult>, TMessage, TResult>(
    handlerCtor: ObjectType<THandler>,
    factoryOrInstance: THandler | Factory<THandler>): this {

    const messageCtors = HandlerFor.messages(handlerCtor);
    if (messageCtors.length === 0) {
      throw new Error('Cannot configure handler. Ensure that @HandlerFor decorator is applied.');
    }

    messageCtors.forEach(m => this.message(m).handleWith(factoryOrInstance));
    this.state = messageCtors.concat();

    return this;
  }

  protected createEntry(messageType: Type): HandledMessageType {
    return <HandledMessageType>{
      name: messageType.name,
      namespace: messageType.namespace,
      handler: undefined,
      interceptors: [],
    };
  }

  protected copyEntry(config: HandledMessageType): HandledMessageType {
    return <HandledMessageType>{
      name: config.name,
      namespace: config.namespace,
      handler: config.handler,
      interceptors: config.interceptors,
    };
  }
}
