import { ObjectType, Handler } from '../interfaces';

const HANDLER_TAG = Symbol('messaging:handler');

export default HandlerFor;

// tslint:disable-next-line:function-name
function HandlerFor<M extends ObjectType<TMessage>, TMessage>(messageCtor: M) {
  return <H extends ObjectType<Handler<TMessage>>>(handlerCtor: H) => {
    if (!handlerCtor[HANDLER_TAG]) {
      Reflect.defineProperty(handlerCtor, HANDLER_TAG, { value: [] });
    }

    handlerCtor[HANDLER_TAG].unshift(messageCtor);
  };
}

namespace HandlerFor {
  export function messages<H extends ObjectType<Handler<TMessage>>, TMessage>(
    ctorOrObject: H | any): ObjectType<TMessage>[] {

    if (!ctorOrObject) return [];

    if (typeof ctorOrObject === 'function') {
      return ctorOrObject[HANDLER_TAG] || [];
    }

    return HandlerFor.messages(ctorOrObject.constructor);
  }
}
