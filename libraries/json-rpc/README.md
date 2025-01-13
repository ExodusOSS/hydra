# API

```js
const RPC = require('@exodus/json-rpc');
const clientOrServer = new RPC({ transport, requestTimeout, methods });

const result = await clientOrServer.callMethod(
  (methodName: String),
  (parameters: Array)
);
clientOrServer.notify((methodName: String), (parameters: Array)); // same as above but one way only

clientOrServer.exposeMethods({
  methodName: params => result // can return promise
});

// same as exposeMethods but allows to add functions one by one
clientOrServer.exposeFunction('methodName', params => result);
```

`transport` is object stream like, anything that implements `write()` method and `on('data', ...)` event

Example usage:

```js
const EventEmitter = require('events');
const RPC = require('@exodus/json-rpc');

const transport1 = new EventEmitter();
const transport2 = new EventEmitter();
transport1.write = data => {
  console.log('Transport1 write: ', data);
  setTimeout(() => {
    console.log('Emitting data2:', data);
    transport2.emit('data', data);
  }, 500);
};
transport2.write = data => {
  console.log('Transport2 write: ', data);
  setTimeout(() => {
    console.log('Emitting data1:', data);
    transport1.emit('data', data);
  }, 500);
};

const server1 = new RPC({ transport: transport1 });
const server2 = new RPC({ transport: transport2 });

server2.exposeMethods({
  testMethod1: (a, b) => {
    console.log('Here!', a, b);
    throw new Error('oops');
    return a + b;
  },
  testMethod2: (a, b) => {
    return Promise.resolve(123);
  },
  testMethod3: (a, b) => {
    return;
  }
});

server1.exposeMethods({
  foo: () => {
    throw new Error('oops');
  }
});

async function main() {
  const sum = await server1.callMethod('testMethod1', [22, 33]);
  console.log(sum);
  await server2.notify('foo');
  await server2.notify('XXX');

  // get the raw response object when making a method call:
  const { id, jsonrpc, error, result: sum } = server1.callMethodWithRawResponse('testMethod1', [22, 33]);
  console.log(sum)
}

main().catch(console.log);
```

When the transport emits a message, by default RPC will parse the message with `JSON.parse`. You can customize this with your own parsing function by specifying the `parse` constructor option.

```js
const rpc = new RPC({
  transport,
  parse: (jsonString) => {
    // Enforce a maximum message size
    if (jsonString.length > 1000)
      throw new Error('message is too long')

    // Log messages as they are parsed
    console.log(`New message: ${jsonString}`)

    return JSON.parse(jsonString)
  },
})
```
