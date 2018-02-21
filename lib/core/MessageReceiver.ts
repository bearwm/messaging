import Message from '../annotation/Message';
import Decorator from '../annotation/Decorator';
import MessagingError from './MessagingError';
import {
  ObjectType,
  Handler,
  Type,
  Request,
  Response,
  Observer,
  Receiver,
  ReceiverConfigurator,
  ReceiverInterceptor,
  InterceptionContext,
  RequestResolver,
  HandlerDecorator,
  HandledMessageType,
} from '../interfaces';
import { ChainRegistry } from './ChainRegistry';
import { ChainBuilder } from './ChainBuilder';

export default class MessageReceiver
  implements Receiver {

  protected readonly interceptors: ReceiverInterceptor[] = [];
  private readonly messageTypes: Map<ObjectType, HandledMessageType> = new Map();
  private readonly messageTypeNames: Map<string, ObjectType> = new Map();

  public constructor(
    private readonly observer: Observer,
    private readonly registry: ChainRegistry = new ChainRegistry(),
    private readonly builder: ChainBuilder = new ChainBuilder(),
  ) {
    if (!observer) throw new Error('Null observer.');
    if (!registry) throw new Error('Null registry.');
    if (!builder) throw new Error('Null builder.');

    registry.registerFactory(messageCtor => this.createChain(messageCtor));
    this.observer.onMessage(request => this.receiveMessage(request));
  }

  interceptAll(interceptor: ReceiverInterceptor, ...interceptors: ReceiverInterceptor[]): this;
  interceptAll(decorator: HandlerDecorator, ...decorators: HandlerDecorator[]): this;
  interceptAll(item: any, ...items: any[]): this {
    items.unshift(item);
    const interceptors = items
      .map(x => <any>Decorator.asInterceptor(x))
      .filter(x => x !== undefined);

    this.interceptors.push(...interceptors);
    this.registry.clear();

    return this;
  }

  configure(configurator: ReceiverConfigurator): this {
    const map = configurator.build();

    map.forEach((value, key) => {
      const newValue = this.merge(this.messageTypes.get(key), value);
      this.messageTypes.set(key, newValue);
      this.messageTypeNames.set(typeId(newValue), key);
    });

    return this;
  }

  private merge(left: HandledMessageType, right: HandledMessageType): HandledMessageType {
    if (!right) return left;
    if (!left) return right;

    return {
      name: right.name !== undefined ? right.name : left.name,
      namespace: right.namespace !== undefined ? right.namespace : left.namespace,
      handler: right.handler !== undefined ? right.handler : left.handler,
      interceptors: left.interceptors.concat(right.interceptors),
    };
  }

  private createChain(messageCtor: ObjectType): RequestResolver {
    const messageType = this.messageTypes.get(messageCtor);
    const interceptors = this.getInterceptors(messageCtor, messageType)
      .map(i => (ctx, next) => i.handle(ctx.data(), next, ctx));

    return this.builder.build<Request, Response>(
      context => this.handle(context.data(), context),
      interceptors);
  }

  private getInterceptors(messageCtor: ObjectType, config: HandledMessageType) {
    // Interceptors are added in the following order:
    // 1. interceptors configured for current receiver
    // 2. interceptors configured using fluent configurations
    // 3. interceptors decorated on the handler class
    return this.interceptors
      .concat(config.interceptors)
      .concat(Decorator.get<ObjectType<Handler>>(this.createHandler(config)));
  }

  protected handle(request: Request, context: InterceptionContext): Promise<Response> {
    const config = this.messageTypes.get(request.data.constructor);
    if (!config) throwMissingHandler(request.type);

    const id = request.id;
    const handler = this.createHandler(config);
    const result = handler.handle(request.data);

    return Promise.resolve(result).then(data => <Response>{ id, data, headers: {} });
  }

  private createHandler(type: HandledMessageType) {
    if (type === undefined || type.handler === undefined) {
      throwMissingHandler(type);
    }

    const handler = typeof type.handler === 'function' ?
      type.handler() : type.handler;

    if (!handler) throwNullHandler(type);
    return handler;
  }

  private receiveMessage(request: Request): Promise<Response> {
    if (!request) return Promise.reject('Received a null request.');

    const id = request.id;

    try {
      const messageCtor = this.mapRequest(request);
      const chain = this.registry.get(messageCtor);

      return chain(request)
        .catch(error => Promise.resolve(<Response>{ id, error, headers: {} }));
    } catch (error) {
      return Promise.resolve(<Response>{ id, error, headers: {} });
    }
  }

  private mapRequest(request: Request) {
    const messageTypeId = typeId(request.type);
    if (!this.messageTypeNames.has(messageTypeId)) throwMissingHandler(request.type);

    const messageCtor = this.messageTypeNames.get(messageTypeId);
    Object.setPrototypeOf(request.data, messageCtor);
    request.data.constructor = messageCtor;

    return messageCtor;
  }
}

function throwMissingHandler(type: Type): never {
  throw new MessagingError(
    'MissingHandler',
    `No handler has been registered for messages of type [${typeId(type)}].`);
}

function throwNullHandler(type: Type): never {
  throw new MessagingError(
    'MissingHandler',
    `The handler factory returned a null reference for message of type [${typeId(type)}].`);
}

function typeId(type: Type) {
  return type ? [type.namespace, type.name].filter(x => x).join('.') : undefined;
}
