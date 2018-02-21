import {
  Factory,
  ObjectType,
  MessageDecorator,
  HandlerDecorator,
  SenderInterceptor,
  ReceiverInterceptor,
  Handler,
} from '../interfaces';

const DECORATORS_TAG: symbol = Symbol('messaging:@decorators');

export default Decorator;

/**
 * Creates a new decorator that can be applied both, on messages and handlers.
 * @param factory a factory method that returns an interceptor instance
 */
// tslint:disable-next-line:function-name
function Decorator<T extends ObjectType, TMessage, TResult>(
  factory: Factory<ReceiverInterceptor<TMessage, TResult> & SenderInterceptor<TMessage, TResult>>):
  (constructor: T) => void;

/**
 * Creates a new decorator that can be applied on handlers.
 * @param factory a factory method that returns an interceptor instance
 */
// tslint:disable-next-line:function-name
function Decorator<T extends ObjectType<Handler<TMessage, TResult>>, TMessage, TResult>(
  factory: Factory<ReceiverInterceptor<TMessage, TResult>>): (constructor: T) => void;

/**
 * Creates a new decorator that can be applied on messages.
 * @param factory a factory method that returns an interceptor instance
 */
// tslint:disable-next-line:function-name
function Decorator<T extends ObjectType<TMessage>, TMessage, TResult>(
  factory: Factory<SenderInterceptor<TMessage, TResult>>): (constructor: T) => void;

// tslint:disable-next-line:function-name
function Decorator<T extends ObjectType>(factory: Factory<any>): (constructor: T) => void {
  return (constructor: T) => {
    if (!constructor[DECORATORS_TAG]) {
      Reflect.defineProperty(constructor, DECORATORS_TAG, { value: [] });
    }

    constructor[DECORATORS_TAG].unshift(factory());
  };
}

namespace Decorator {
  /**
   * Gets all decorators from a handler constructor function
   * @param constructor constructor function of a message handler
   */
  export function get<T extends ObjectType<Handler<TMessage, TResult>>, TMessage, TResult>(
    constructor: T): ReceiverInterceptor<TMessage, TResult>[];

  /**
   * Gets all decorators from a message constructor function
   * @param constructor constructor function of a message
   */
  export function get<T extends ObjectType<TMessage>, TMessage, TResult>(
    constructor: T): SenderInterceptor<TMessage, TResult>[];

  /**
     * Gets all decorators from a handler instance.
     * @param constructor constructor function of a message
     */
  export function get<TMessage>(handler: Handler<TMessage>): ReceiverInterceptor[];

  /**
   * Gets all decorators from a message instance.
   * @param constructor constructor function of a message
   */
  export function get<TMessage>(message: TMessage): SenderInterceptor[];

  export function get<T>(ctorOrObject: T): (ReceiverInterceptor | SenderInterceptor)[] {
    if (ctorOrObject === undefined || ctorOrObject === null) return [];
    if (typeof ctorOrObject !== 'function') return Decorator.get(ctorOrObject.constructor);

    return (ctorOrObject[DECORATORS_TAG] || []).concat();
  }

  /**
   * Extracts the interceptor from a message decorator. 
   * If already an interceptor then just returns it.
   * @param decorator message decorator or sender interceptor
   */
  export function asInterceptor(decorator: MessageDecorator | SenderInterceptor):
    SenderInterceptor;

  /**
   * Extracts the interceptor from a handler decorator. 
   * If already an interceptor then just returns it.
   * @param decorator handler decorator or receiver interceptor
   */
  export function asInterceptor(decorator: HandlerDecorator | ReceiverInterceptor):
    ReceiverInterceptor;
  export function asInterceptor(decorator: any): SenderInterceptor | ReceiverInterceptor {
    if (typeof decorator !== 'function') return decorator;

    const target = class { };
    decorator(target);

    return Decorator.get(target)[0];
  }
}
