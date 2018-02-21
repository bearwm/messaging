import { Type, ObjectType } from '../interfaces';

const TYPE_TAG = Symbol('messaging:type');

export default Message;

// tslint:disable-next-line:function-name
function Message(options?: { type?: string, namespace?: string }) {
  return <T extends ObjectType>(constructor: T) => {
    const definition = Message.createDefinition(constructor, options);
    Reflect.defineProperty(constructor, TYPE_TAG, { value: definition });
  };
}

namespace Message {

  /**
   * Creates a definion for a given type (constructor function)
   * @param constructor the type
   * @param options additional options to define the type name and namespace. 
   * Type name defaults to constructor's name.
   */
  export function createDefinition<T extends ObjectType>(
    constructor: T,
    options: { type?: string, namespace?: string } = {}): Type {

    const name = options.type !== undefined ? options.type : constructor.name;
    const namespace = options.namespace;
    const definition: Type = { name, namespace };

    return definition;
  }

  /**
   * Gets the type definition for a given object or constructor function.
   * @param ctorOrObject object or constructor function
   */
  export function type<T extends ObjectType<T>>(ctorOrObject: T | any): Type {
    if (!ctorOrObject) return undefined;

    if (typeof ctorOrObject === 'function') {
      return ctorOrObject[TYPE_TAG] || <Type>{
        name: ctorOrObject.name,
      };
    }

    return Message.type(ctorOrObject.constructor);
  }
}
