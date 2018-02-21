import Dispatcher from '../interfaces/Dispatcher';
import Request from '../interfaces/Request';
import Response from '../interfaces/Response';
import EventRegistry from './EventRegistry';

export default class EventDispatcher implements Dispatcher {
  constructor(
    private name: string,
    private registry: EventRegistry = EventRegistry.instance) { }

  dispatch<TMessage, TResult>(request: Request<TMessage>): Promise<Response<TResult>> {
    const listener = this.registry.get(this.name);
    return listener(request)
      .catch(error => <Response>{ error, id: request.id, headers: {} });
  }

  forget<TMessage>(request: Request<TMessage>): void { }
}
