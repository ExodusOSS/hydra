# `@exodus/await-proxy`

Proxies a module and delays all module calls until the specified promise resolves.

## Usage

This is an example of desktop RPC usage:

```js
import awaitProxy from '@exodus/await-proxy'
import { createClient } from '#/electron-rpc-broadcast'
import Handshake from '#/handshake'

const handshake = new Handshake({
  sendMessage: (message) => ipc.targeted('core', 'handshake', message),
  attachListener: (listener) => ipc.on('handshake', listener),
})

// calls to some-module will be queued until the RPC server is initialized (as indicated by the handshake)
export default awaitProxy({
  object: createClient('core', 'some-module'),
  delayUntil: handshake.awaitDone(),
})
```

## API

### `awaitProxy({ object, delayUntil, synchronousMethods })`

- `object` is the module to be proxied (should only have functions/methods; no properties)
- `delayUntil` is the `Promise` to await before calling methods on `object`
- `synchronousMethods` is an optional array of strings, denoting methods names on `object` that are synchronous, but return an object with async methods. Calls to synchronous methods will return a Proxy, with async functions that await `promise` before actually executing. The underlying synchronous method will only be called after `promise` resolves.
  s
