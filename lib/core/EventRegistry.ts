import { RequestResolver } from '../interfaces/types';

export default class EventRegistry {
  public static instance: EventRegistry = new EventRegistry();
  private readonly channels: Map<string, RequestResolver> = new Map();

  add(eventName: string, listener: RequestResolver) {
    if (this.channels.has(eventName)) {
      throw new Error(`A listener has already been set for events: ${eventName}.`);
    }

    this.channels.set(eventName, listener);
  }

  get(eventName: string): RequestResolver {
    if (!this.channels.has(eventName)) {
      throw new Error(`No listener was set for events: ${eventName}.`);
    }

    return this.channels.get(eventName);
  }
}
