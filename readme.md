@labs42/messaging
========
A powerful framework for asynchronous messaging.

```javascript
// HelloMessage.ts
export class HelloMessage{
  constructor(public text: string){ }
}
```

```javascript
// HelloHandler.ts
export class HelloHandler {
  handle(msg: HelloMessage){
    return `Hello ${msg.text}`;
  }
}
```

```javascript
// setup.ts
export const sender = eventSender('demo');
export const receiver = eventReceiver('demo');

const config = Configurator.receiver()
  .message(HelloMessage)
  .handleWith(() => new HelloHandler);
```

```javascript
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
* Configuration using fluent api
* Support for custom cummunication protocols
* Support for custom decorators and interception

## Core concepts
`@labs42/messaging` is a simple framework that helps build systems composed of small, independent, reusable and testable code blocks.  
Imagine that any code that is executed by the application is a response to some request. Be that request an event, or a command to change something, or a request to query some data, or a transaction, etc. they all cary only information about how to react to a specific request. We call this kind of requests `Message`.  
A `Message` is used only to transport information about how they should be handled. Messagess don't have behavior.
For the application to be able to react to messages, we introduce another kind of actors - `Handler`.  
A `Handler` is capable to react to a *specific* message type.  
Putting it all together, we decompose the application into *messages* and *handlers*, that have a one-to-one relationship.  
`@labs42/messaging` framework implements the above `Message`-`Handler` pattern by using a:
* `Sender` that serves as a dispatcher to submit messages and wait for results;
* `Receiver` that serves as an observer to listen to messages, handle them with a corresponding *handler* and propagate back the result (if any);

The `Sender` and `Receiver` communication rely on abstractions, so that custom protocols like `HTTP`, `IPC` etc. can be implemented.

In order to increase the code reusability and keep the *Single Responsibility Principle*, the framework allows you to define cross-cutting concerns for *messages* and *handlers* by means of `ECMAScript` decorators. For example you could define a timeout for a message execution:
```javascript
@Timeout(1000)
class MyMessage { ... }
```

or just mock a result for a specific message, while the handler is not yet implemented.

```javascript
@Return(new User('John', 'Doe'))
class MyHandler {
  handler(msg: GetUserMessage){ throw new Error('Not implemented.') }
}

See `Interception` below for more information.
```

## Setup
To submit messages and get appropriate results a `Sender` instance is created and exported into the application.

```javascript
import { eventSender, Sender } from '@labs42/messaging';

export const sender = eventSender('unique-channel-name')
```

The exported `sender` instance can later be imported in any place of the application where a message has to be submitted:

```javascript
import { sender } from './sender'

...
const result = await sender.submit(new MyMessage());
...
```

For handlers to be registered, a `Receiver` has to be configured in an application:

```javascript
import { eventReceiver, Receiver } from '@labs42/messaging'

export const receiver = eventReceiver('unique-channel-name'); 
```

Receiver doesn't necessarily need to be exported, as usualy it is not used in other places of the application. However, without creating and storing a `receiver` instance, `sender` will fail to submit messages.

A `receiver` doesn't know by default what handler to use for a specific message, therefore an additional required step is needed to complete the setup for `receiver`:
``` javascript
import { Configurator } from '@labs42/messaging'
const config = Configurator.receiver()
  .message(MyMessage)
  .handleWith(() => new MyHandler());
```

## Configuration
In the above section a minimum configuration setup was presented to make a working example.

The `Sender` and `Receiver` can have following parts configured:
* `Messages` - by default the message's constructor name is used to identify it's type. This can be configured with a custom name and namespace;
* `Interceptors` - a collection of interceptors to be used when sending or receiving a message
* `Handlers` - for `receiver` a message type can be registered to be handled by a specific handler type.

### Configuring `Message`
For both, sender's and receiver's configuration we can specify that a message type has a specific name and namespace. This can be helpful especially when a minimization process is applied and the original message class names loose their meaning. 

Using decoration:
```javascript
@Message({type: 'my-message', namespace: 'com.my-application'})
class MyMessage{}

```

Using configurator
```javascript
const config = Configurator.receiver(); // or: Configurator.sender()
config.message(MyMessage, {type: 'my-message', namespace: 'com.my-application'});

```

It's important to note, that sender and receiver could run even in different processes, or even machines. Therefore it's not the reference of the message's constructor that is used to identify the type, but the configuration.

If a message has a difinition by decorator, and at the same time being configured, then the configured part takes priority.

A default namespace can be configured within a particular configurator, using the `.namespace()` method:
```javascript
const config = Configurator.receiver(); // or: Configurator.sender()

config
  .namespace('default-namespace')
  .message(MyMessage, {namespace: 'com.my-application'})
  .message(AnotherMessage);
```

## Interception

### @Return

### @Throw

### @Timeout

### @Delay

### @Retry

### Implementing a custom interceptor

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

Copyright © 2018 Labs42