import Message from './annotation/Message';
import Decorator from './annotation/Decorator';
import HandlerFor from './annotation/HandlerFor';

import Configurator from './configuration/Configurator';

import MessageSender from './core/MessageSender';
import MessageReceiver from './core/MessageReceiver';
import EventDispatcher from './core/EventDispatcher';
import EventObserver from './core/EventObserver';
import MessagingError from './core/MessagingError';
import Sender from './interfaces/Sender';
import Receiver from './interfaces/Receiver';

import { Delay, DelayInterceptor } from './interception/delay';
import { Retry, RetryInterceptor } from './interception/retry';
import { Return, ReturnInterceptor } from './interception/return';
import { Throw, ThrowInterceptor } from './interception/throw';
import { Timeout, TimeoutInterceptor } from './interception/timeout';


export * from './interfaces';

export { Message };
export { HandlerFor };
export { Decorator };

export { Configurator };

export { MessageSender };
export { MessageReceiver };
export { EventDispatcher };
export { EventObserver };
export { MessagingError };

export { Delay, DelayInterceptor };
export { Retry, RetryInterceptor };
export { Return, ReturnInterceptor };
export { Throw, ThrowInterceptor };
export { Timeout, TimeoutInterceptor };

export function eventSender(eventName: string): Sender {
  return new MessageSender(new EventDispatcher(eventName));
}

export function eventReceiver(eventName: string): Receiver {
  return new MessageReceiver(new EventObserver(eventName));
}
