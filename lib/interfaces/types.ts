import Request from './Request';
import Response from './Response';
import Handler from './Handler';
import SenderInterceptor from './SenderInterceptor';
import ReceiverInterceptor from './ReceiverInterceptor';

export type Factory<T> = () => T;
export type ObjectType<T = any> = { new(...args: any[]): T };

export type RequestResolver<TIn = any, TOut = any> =
  (request: Request<TIn>) => Promise<Response<TOut>>;

export type MessageDecorator<TMessage = any> =
  <T extends ObjectType<TMessage>>(messageCtor: T) => void;

export type HandlerDecorator<TMessage = any, TResult = any> =
  <T extends ObjectType<Handler<TMessage, TResult>>>(handlerCtor: T) => void;

export type Type = {
  name: string;
  namespace?: string;
};

export type InterceptedType<T = any> = Type & { interceptors: T[] };
export type MessageType = InterceptedType<SenderInterceptor>;
export type HandledMessageType =
  InterceptedType<ReceiverInterceptor> & { handler: Handler | Factory<Handler>; };
