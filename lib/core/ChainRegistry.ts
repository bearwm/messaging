import { ObjectType, RequestResolver } from '../interfaces/types';

export class ChainRegistry {
  private readonly compiledChains: Map<ObjectType, RequestResolver> = new Map();
  private factory: (messageCtor: ObjectType) => RequestResolver;

  registerFactory(factory: (messageCtor: ObjectType) => RequestResolver): this {
    this.factory = factory;
    return this;
  }

  get<TMessage, TResult>(messageCtor: ObjectType):
    RequestResolver<TMessage, TResult> {

    if (!this.compiledChains.has(messageCtor)) {
      const chain = this.factory(messageCtor);
      this.compiledChains.set(messageCtor, chain);
    }

    return this.compiledChains.get(messageCtor);
  }

  clear(): void {
    this.compiledChains.clear();
  }
}
