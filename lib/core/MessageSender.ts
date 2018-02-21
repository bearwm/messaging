import * as uuid from 'uuid/v4'; // random UUID

import Message from '../annotation/Message';
import Decorator from '../annotation/Decorator';
import {
  ObjectType,
  MessageDecorator,
  RequestResolver,
  MessageType,
  InterceptionContext,
  SenderInterceptor,
  Request,
  Response,
  SenderConfigurator,
  Dispatcher,
  Sender,
} from '../interfaces';
import { ChainRegistry } from './ChainRegistry';
import { ChainBuilder } from './ChainBuilder';

export default class MessageSender
  implements Sender {

  private readonly interceptors: SenderInterceptor[] = [];
  private readonly messageTypes: Map<ObjectType, MessageType> = new Map();

  public constructor(
    private readonly dispatcher: Dispatcher,
    private readonly registry: ChainRegistry = new ChainRegistry(),
    private readonly builder: ChainBuilder = new ChainBuilder(),
  ) {
    if (!dispatcher) throw new Error('Null dispatcher.');
    if (!registry) throw new Error('Null registry.');
    if (!builder) throw new Error('Null builder.');

    registry.registerFactory(messageCtor => this.createChain(messageCtor));
  }

  interceptAll(interceptor: SenderInterceptor, ...interceptors: SenderInterceptor[]): this;
  interceptAll(decorator: MessageDecorator, ...decorators: MessageDecorator[]): this;
  interceptAll(item: any, ...items: any[]): this {
    items.unshift(item);
    const interceptors = items
      .map(x => Decorator.asInterceptor(x))
      .filter(x => x);

    this.interceptors.push(...interceptors);
    this.registry.clear();

    return this;
  }

  submit<TMessage, TResult>(message: TMessage): Promise<TResult> {
    if (!message) throw new Error('Null message.');

    const messageCtor = this.getMessageCtor(message);
    const messageType = this.getMessageType(messageCtor);

    const chain = this.registry.get<TMessage, TResult>(messageCtor);
    const request = this.createRequest(message, messageType);

    return chain(request)
      .then((response) => {
        return response.error ? Promise.reject<TResult>(response.error) : response.data;
      });
  }

  configure(configurator: SenderConfigurator): this {
    const map = configurator.build();

    map.forEach((value, key) => {
      const newValue = this.merge(this.messageTypes.get(key), value);
      this.messageTypes.set(key, newValue);
    });

    return this;
  }

  private merge(left: MessageType, right: MessageType): MessageType {
    if (!left) return right;
    if (!right) return left;

    return {
      name: right.name !== undefined ? right.name : left.name,
      namespace: right.namespace !== undefined ? right.namespace : left.namespace,
      interceptors: left.interceptors.concat(right.interceptors),
    };
  }

  private createRequest<TMessage>(message: TMessage, config: MessageType): Request<TMessage> {
    return <Request<TMessage>>{
      id: uuid(),
      type: { name: config.name, namespace: config.namespace },
      data: message,
      headers: {},
    };
  }

  private createChain(messageCtor: ObjectType): RequestResolver {
    const messageType = this.getMessageType(messageCtor);
    const interceptors = this.getInterceptors(messageCtor, messageType)
      .map(i => (ctx, next) => i.submit(ctx.data(), next, ctx));

    return this.builder.build<Request, Response>(
      context => this.dispatch(context.data(), context),
      interceptors);
  }

  private getMessageCtor<TMessage>(message: TMessage) {
    return <ObjectType<TMessage>>message.constructor;
  }

  private getMessageType(messageCtor: ObjectType) {
    const configuredType = this.messageTypes.get(messageCtor);
    if (configuredType) return configuredType;

    const type = Message.type(messageCtor);
    return {
      name: type.name,
      namespace: type.namespace,
      interceptors: [],
    };
  }

  private getInterceptors(messageCtor: ObjectType, config: MessageType) {
    // Interceptors are added in the following order:
    // 1. interceptors configured for current Sender/Receiver
    // 2. interceptors configured using fluent configurations
    // 3. interceptors decorated on the Message/Handler class
    return this.interceptors
      .concat(config.interceptors)
      .concat(Decorator.get<ObjectType>(messageCtor));
  }

  private dispatch(request: Request, context: InterceptionContext): Promise<Response> {
    context.onCancel(() => this.dispatcher.forget(request));
    return this.dispatcher.dispatch(request);
  }
}
