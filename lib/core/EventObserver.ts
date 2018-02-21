import Observer from '../interfaces/Observer';
import { RequestResolver } from '../interfaces/types';
import EventRegistry from './EventRegistry';

export default class EventObserver implements Observer {
  constructor(
    private name: string,
    private registry: EventRegistry = EventRegistry.instance) { }

  onMessage(listener: RequestResolver): void {
    if (!listener) throw new Error('Null listener.');
    this.registry.add(this.name, listener);
  }
}
