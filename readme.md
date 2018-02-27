@labs42/messaging
========
A powerful framework for asynchronous messaging.


[![npm](https://img.shields.io/npm/v/@labs42/messaging.svg)](https://www.npmjs.com/package/@labs42/messaging)
[![Build Status](https://travis-ci.org/labs42io/messaging.svg?branch=master)](https://travis-ci.org/labs42io/messaging)
[![Coverage Status](https://coveralls.io/repos/github/labs42io/messaging/badge.svg)](https://coveralls.io/github/labs42io/messaging)
[![npm](https://img.shields.io/npm/l/@labs42/messaging.svg)](https://github.com/labs42io/messaging)

```typescript
// HelloMessage.ts
export class HelloMessage{
  constructor(public text: string){ }
}
```

```typescript
// HelloHandler.ts
export class HelloHandler {
  handle(msg: HelloMessage){
    return `Hello ${msg.text}`;
  }
}
```

```typescript
// setup.ts
export const sender = eventSender('demo');
export const receiver = eventReceiver('demo');

const config = Configurator.receiver()
  .message(HelloMessage)
  .handleWith(() => new HelloHandler);
```

```typescript
// example.ts
import { sender } from './sender'

const msg = new HelloMassage('World');
sender.submit(msg).then(result => console.log(result));

// prints: `Hello World`
```

## Installation
```bash
  $ npm install @labs42/messaging --save
```

## Features
* Decouple large systems into small, reusable code blocks
* Configuration using decorators
* Configuration using fluent API
* Support for custom communication protocols
* Interceptors: @Retry, @Timeout, @Return, @Throw, @Delay
* Support for custom message interception

## Philosophy
`@labs42/messaging` is a simple framework that helps build systems composed of small, independent, reusable and testable code blocks.  
Imagine that any code that is executed by the application is a response to some request. Be that request a method call, or a command to change something, or a request to query some data, or a transaction, etc. they all contain only information about how to execute a specific operation. We call this kind of requests `Message`.  
A `Message` is used only to transport information about how they should be handled. Messages don't have behavior.
For the application to be able to react to messages, we introduce another kind of actor - `Handler`.  
A `Handler` is able to react to a *specific* message type.  
Putting it all together, we decompose the application into *messages* and *handlers*, that have a one-to-one relationship.  
The above `Message`-`Handler` pattern is implemented by using a:
* `Sender` that serves as a dispatcher to submit messages and wait for results;
* `Receiver` that serves as an observer to listen to messages, handle them with an appropriate *handler* and propagate back the result (if any);

The `Sender` and `Receiver` communication rely on abstractions, so that custom protocols like `HTTP`, `IPC` etc. can be configured.

The framework allows to intercept the communication process between a sender and a receiver. An interceptor provides full control on how a message is dispatched and received.
Interceptors can be easily attached/detached from messages and handlers using decorators.  
For example you could define a [timeout](#timeout) for a message execution:
```typescript
@Timeout(1000)
class MyMessage { ... }
```

or just mock a result for a specific message using the [return](#return) decorator, while the handler hasn't been implemented yet.

```typescript
@Return(new User('John', 'Doe'))
class MyHandler {
  handler(msg: GetUserMessage){ throw new Error('Not implemented.') }
}
```
See [interception](#interception) below for more information about built-in interceptors and implementing a custom interceptor.


## Setup
To enable an application to send and respond to messages, an instance of `Sender` and `Receiver` has to be created. The sender's instance must be exported in order to be referenced in any place where a message has to be submitted.

### Sender
For an application to be able to send messages, an instance of `Sender` has to be created.
```javascript
import { Sender, MessageSender, EventDispatcher } from '@labs42/messaging';

const dispatcher = new EventDispatcher('unique-channel-name');
export const sender: Sender = new MessageSender(dispatcher);
```
This creates and exports a new instance of message sender, using a `EventDispatcher`. The dispatcher's constructor accepts a parameter, which is the name of event channel.  
The `EventDispatcher` can be used to dispatch messages only within the same application.  

A helper method `eventSender` is available that is equivalent with above setup:
```typescript
import { eventSender, Sender } from '@labs42/messaging';
export const sender: Sender = eventSender('unique-channel-name')
```

A sender can be configured with global or message specific interceptors. See [configuration](#configuration) for more details.

### Receiver
For an application to be able to receive messages, an instance of `Receiver` has to be created.
```typescript
import { Receiver, MessageReceiver, EventObserver } from '@labs42/messaging'

const observer = new EventObserver('unique-channel-name');
export const receiver:Receiver = new MessageReceiver(observer);
receiver.configure(...);
```
This creates and exports a new instance of message receiver, using the `EventObserver`. The observer's constructor accepts a parameter, which is the name of event channel. The `EventObserver` can be used to listen to messages only dispatched within the same application. 
By configuring the same channel name in the dispatcher and observer, the sender and receiver are connected and ready to communicate.  

A helper method `eventReceiver` is available that is equivalent with above setup:
```typescript
import { eventReceiver, Receiver } from '@labs42/messaging'

export const receiver = eventReceiver('unique-channel-name');
receiver.configure(...);
```

Although in above examples the receiver is exported, this is not needed unless it is referenced in other places to be configured. The only requirement is that a receiver instance is created and alive for the whole application lifetime.  

Receivers once created, don't know how to handle and respond to incoming messages. In order to instruct the receiver how to handle specific message, it has to be configured. See [configuration](#configuration) for more details.  


## Configuration
Both, sender and receiver can be configured using configurators.
```typescript
import { Configurator, eventSender, eventReceiver } from '@labs42/messaging';

const sender = eventSender('messaging');
const senderConfig = Configurator.sender();
// setup senderConfig ...
sender.configure(senderConfig);

const receiver = eventReceiver('messaging');
const receiverConfig = Configurator.receiver();
// setup receiverConfig...
receiver.configure(receiverConfig);
```

Multiple configurators can be applied.
```typescript
const receiver = eventReceiver('messaging');
const securityConfig = Configurator.receiver();
// setup securityConfig
receiver.configure(securityConfig);

const usersConfig = Configurator.receiver();
// setup usersConfig
receiver.configure(usersConfig)
```

### Sender configuration

To create a new sender configurator:
```typescript
import { Configurator } from '@labs42/messaging'

// create a new sender fluent configurator
const config = Configurator.sender();
```

`.namespace()` defines a default namespace for all configured messages within the current configurator:
```typescript
const config = Configurator.sender();
config.namespace('my-application')
  .message(Msg1)
  .message(Msg2, { namespace: 'ns2' })
  .message(Msg3, { type: 'message-3', namespace: 'ns3' })
  .message(Msg4, { type: 'message-4' });

// Following types will be defined in config:
// Msg1 -> 'my-application.Msg1'
// Msg2 -> 'ns2.Msg2'
// Msg3 -> 'ns3.message-3'
// Msg4 -> 'my-application.Msg4'
```

`.interceptAll()` configures an interceptor to be applied for all messages defined within the current configurator:
```typescript
const config = Configurator.sender();

// Apply the Timeout interceptor (2 seconds)
config.namespace('my-application')
  .interceptAll(Timeout(2000));
  .message(Msg1)
  .message(Msg2);
```

`.message()` configures a message type and allows chaining to configure message specific interceptors:
```typescript
const config = Configurator.sender();

config
  .message(Msg1) // 'Msg1'
  .message(Msg2, { type: 'message-2'}) // 'message-2'
  .message(Msg3, { namespace: 'ns'}) // 'ns.Msg3'
  .message(Msg4, { type: 'message-4', namespace: 'ns'}); // 'ns.message-4'
```

If a message has the `@Message` decorator applied, then it's used as a default:
```typescript
@Message({ type: 'hello', namespace: 'ns' })
class HelloMessage {}

const config = Configurator.sender();
config.message(Hello);
```
is equivalent to:
```typescript
class HelloMessage {}

const config = Configurator.sender();
config.message(Hello, { type: 'hello', namespace: 'ns' });
```

`.message().intercept()` configures an interceptor for a specific message type:
```typescript
const config = Configurator.sender();

// configures retry and timeout interceptors for `Login` message
config
  .message(Login)
  .intercept(Retry(5))
  .intercept(Timeout(3));
```

`@Message()` decorator can be applied to a message type to provide custom type metadata:
```typescript
@Message({ type: 'hello', namespace: 'ns' })
class HelloMessage {}

// `HelloMessage` type full name is: 'ns.hello'
```
If type parameter is not provided, then the class name is used as a default

### Receiver configurator

To create a new receiver configurator:
```typescript
import { Configurator } from '@labs42/messaging'

// create a new receiver fluent configurator
const config = Configurator.receiver();
```

`.namespace()` defines a default namespace for all configured messages within the current configurator:
```typescript
const config = Configurator.receiver();
config.namespace('my-application')
  .message(Msg1)
  .message(Msg2, { namespace: 'ns2' })
  .message(Msg3, { type: 'message-3', namespace: 'ns3' })
  .message(Msg4, { type: 'message-4' });

// Following types will be defined in config:
// Msg1 -> 'my-application.Msg1'
// Msg2 -> 'ns2.Msg2'
// Msg3 -> 'ns3.message-3'
// Msg4 -> 'my-application.Msg4'
```

`.interceptAll()` configures an interceptor to be applied for all messages defined within the current configurator:
```typescript
const config = Configurator.receiver();

// Apply the Timeout interceptor (2 seconds)
config.namespace('my-application')
  .interceptAll(Timeout(2000));
  .message(Msg1)
  .message(Msg2);
```

`.message()` configures a message type and allows chaining to configure message specific interceptors and/or a message handler :
```typescript
const config = Configurator.receiver();

config
  .message(Msg1) // 'Msg1'
  .message(Msg2, { type: 'message-2'}) // 'message-2'
  .message(Msg3, { namespace: 'ns'}) // 'ns.Msg3'
  .message(Msg4, { type: 'message-4', namespace: 'ns'}); // 'ns.message-4'
```

If a message has the `@Message` decorator applied, then it's used as a default:
```typescript
@Message({ type: 'hello', namespace: 'ns' })
class HelloMessage {}

const config = Configurator.receiver();
config.message(Hello);
```
is equivalent to:
```typescript
class HelloMessage {}

const config = Configurator.receiver();
config.message(Hello, { type: 'hello', namespace: 'ns' });
```

`.message().handleWith()` configures a handler for a specific message type. To configure a singleton handler instance:
```typescript
const config = Configurator.receiver();
config.message(Hello).handleWith(new HelloHandler());
```

To configure a handler factory method:
```typescript
const config = Configurator.receiver();
config.message(Hello).handleWith(HelloHandler, () => new HelloHandler());
```


`.message().intercept()` configures an interceptor for a specific message type. Available only after `.message` chaining:
```typescript
const config = Configurator.receiver();

// configures retry and timeout interceptors for `Login` message
config
  .message(Login)
  .intercept(Retry(5))
  .intercept(Timeout(3));
```

`.handler()` configures a handler which is decorated using the `@HandlerFor` decorator.
```typescript
class Hello { }

@HandlerFor(Hello)
class HelloHandler { ... }

const config = Configurator.receiver();

// to configure a singleton handler 
config.handler(Login, new LoginHandler());

// to configure a factory method
config.handler(Login, () => new LoginHandler());
```

## Interception

### @Return
`@Return` interceptor allows to configure a result for a message type.  
If the interceptor is applied on sender's side, then the result is returned without dispatching the message to the receiver.  
```typescript
@Return(true)
class LoginMessage { ... }
```

If the interceptor is applied on receiver's side, then the result is returned without executing the handler.
```typescript
@Return(true)
class LoginHandler implements Handler { ... }
```

### @Throw
`@Throw` interceptor allows to configure an error to be thrown whenever a message is submitted.  
If the interceptor is applied on sender's side, then the error is thrown without dispatching the message to the receiver.  
```typescript
@Throw(new Error('No handler is implemented yet.'))
class LoginMessage { ... }
```

If the interceptor is applied on receiver's side, then the error is thrown without executing the handler.
```typescript
@Throw('Not implemented.')
class LoginHandler implements Handler { ... }
```

### @Timeout
`@Timeout` interceptor allows to configure a timeout interval for a message execution.  
If the interceptor is applied on sender's side, then the timeout interval includes also the time to dispatch the message.  
```typescript
@Timeout(2000)
class LoginMessage { ... }
```

If the interceptor is applied on receiver's side, then the timeout interval includes includes the time to execute the message by the handler.  
```typescript
@Timeout(2000)
class LoginHandler implements Handler { ... }
```

### @Delay
`@Delay` interceptor allows to configure a custom delay for a message execution.  
If the interceptor is applied on sender's side, then the delay is applied before dispatching the message.  
```typescript
@Delay(2000) // 2 seconds
class LoginMessage { ... }
```

If the interceptor is applied on receiver's side, then the delay is applied before executing the message by the handler.  
```typescript
@Delay(2000)
class LoginHandler implements Handler { ... }
```

### @Retry
`@Retry` interceptor allows to configure the number of retry attempts for a failing message.  
```typescript
@Retry() // defaults to retry once in case of a failure
class LoginMessage { ... }

@Retry(3) // defaults to retry three times in case of failures
class LoginMessage { ... }
```
If a message fails after the configured number of attempts, then last error is propagated.  
Additionally, a retry can be configured for specific errors:
```typescript
// Configures a retry only for errors with message: 'Service unavailable.'
@Retry(2, error => error.message === 'Service unavailable.')
class LoginMessage { ... }
```

The interceptor can also be applied on a message handler.

### Implementing a custom interceptor
An interceptor can be created either to intercept messages on the sender's side, receiver's side, or both.

To create an interceptor to be used on the sender's side:
```typescript
class MyInterceptor implements SenderInterceptor {
  submit(request: Request, next: RequestResolver): Promise<Response> {
    // clears the id property of a message before submitting
    request.data.id = null;

    // chain the request to next interceptor
    return next(request);
  }
}
```

To create an interceptor to be used on the receiver's side:
```typescript
class MyInterceptor implements ReceiverInterceptor {
  handle(request: Request, next: RequestResolver): Promise<Response> {
    // request.data contains the original message
    // ...

    // chain the request to next interceptor
    return next(request);
  }
}
```

To define a decorator for a custom interceptor:
```typescript
import { Decorator } from '@labs42/messaging'
const MyDecorator = () => Decorator(() => new MyInterceptor());

@MyDecorator()
class MyMessage { }
```

## Running tests
```bash
$ npm install
$ npm test
```

## Running examples
```bash
$ ts-node examples/basic
$ ts-node examples/message-decoration
$ ts-node examples/fluent-configuration
$ ts-node examples/decorators-mock-results
```

## Roadmap
### Implement `HTTP` protocol: @labs42/messaging-http
### Implement `IPC` protocol: @labs42/messaging-ipc
### Implement *microservices* infrastructure: @labs42/messaging-micro

## License
[MIT](LICENSE)

Copyright © 2018 [Labs42](https://labs42.io/)