import Decorator from '../annotation/Decorator';
import Message from '../annotation/Message';
import {
  ObjectType,
  Type,
  InterceptedType,
} from '../interfaces';

export default abstract class AbstractConfigurator
  <TConfig extends InterceptedType<TInterceptor>, TInterceptor, TDecorator>{

  protected defaultNamespace: string = undefined;
  protected readonly interceptors: TInterceptor[] = [];
  protected readonly entries: Map<ObjectType, TConfig> = new Map();
  protected state: ObjectType[] = [];

  intercept(
    interceptorOrDecorator: TInterceptor | TDecorator,
    ...interceptorsOrDecorators: (TInterceptor | TDecorator)[]): this {

    this.state.forEach((state) => {
      const config = this.entries.get(state);
      config.interceptors.push(
        ...this.asInterceptors(interceptorOrDecorator, interceptorsOrDecorators));
    });

    return this;
  }

  interceptAll(
    interceptorOrDecorator: TInterceptor | TDecorator,
    ...interceptorsOrDecorators: (TInterceptor | TDecorator)[]): this {

    this.interceptors.push(
      ...this.asInterceptors(interceptorOrDecorator, interceptorsOrDecorators));

    this.state = [];
    return this;
  }

  message<TMessage>(
    constructor: ObjectType<TMessage>,
    options?: { type?: string, namespace?: string }): this {

    const config = this.entries.get(constructor) || Message.type(constructor);
    if (options) {
      if (options.type !== undefined) config.name = options.type;
      if (options.namespace !== undefined) config.namespace = options.namespace;
    }

    this.set(constructor, config);
    this.state = [constructor];
    return this;
  }

  namespace(ns: string): this {
    this.defaultNamespace = ns;
    return this;
  }

  build(): Map<ObjectType, TConfig> {
    const map = new Map<ObjectType, TConfig>();

    this.entries.forEach((value, key) => {
      map.set(key, this.buildEntry(key, value));
    });

    this.state = [];
    return map;
  }

  protected abstract createEntry(messageType: Type): TConfig;
  protected abstract copyEntry(config: TConfig): TConfig;

  private buildEntry(constructor: ObjectType, value: TConfig) {
    const entry = this.copyEntry(value);

    entry.interceptors = this.interceptors
      .concat(value.interceptors);

    if (this.defaultNamespace !== undefined && entry.namespace === undefined) {
      entry.namespace = this.defaultNamespace;
    }

    return entry;
  }

  private asInterceptors(
    interceptorOrDecorator: TInterceptor | TDecorator,
    interceptorsOrDecorators: (TInterceptor | TDecorator)[]): TInterceptor[] {

    interceptorsOrDecorators.unshift(interceptorOrDecorator);
    return interceptorsOrDecorators.map(x => <any>Decorator.asInterceptor(<any>x));
  }

  private set(constructor: ObjectType, messageType: Type) {
    return this.entries.has(constructor) ?
      this.update(constructor, messageType) :
      this.add(constructor, messageType);
  }

  private add(constructor: ObjectType, messageType: Type) {
    const newEntry = this.createEntry(messageType);
    this.entries.set(constructor, newEntry);

    return newEntry;
  }

  private update(constructor: ObjectType, messageType: Type) {
    const entry = this.entries.get(constructor);
    entry.name = messageType.name;
    entry.namespace = messageType.namespace;

    return entry;
  }
}
