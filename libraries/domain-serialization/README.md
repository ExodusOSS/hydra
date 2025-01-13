# @exodus/domain-serialization

Exodus-specific serialization for common non-POJO objects like [@exodus/models](../models/README.md) and [assets](https://github.com/ExodusMovement/assets), for use in multi-process wallet applications.

## Install

```sh
yarn add @exodus/domain-serialization
```

## Usage

The assumption is that the Exodus SDK ([@exodus/headless](../../sdks/headless)) runs in the background process, while sending data and accepting calls from the UI process. The below example uses `@exodus/browser-extension-rpc`, but serialization itself is not specific to the browser extension environment.

```js
// background process
import { createRPC } from '@exodus/browser-extension-rpc/background'
import { createBackendDomainSerialization } from '@exodus/domain-serialization'

const { deserialize, serialize } = createBackendDomainSerialization()
const rpc = createRPC({
  methods: exodus, // e.g. an instance of @exodus/headless
  serialize,
  deserialize,
})

// use serialize and deserialize for messaging with the UI process
```

```js
// UI process
import { createRPC } from '@exodus/browser-extension-rpc/ui'
import { createUIDomainSerialization } from '@exodus/domain-serialization'
import store from '~/flux/store'

const { deserialize, serialize } = createUIDomainSerialization({
  getStoredAssets: () => flux.store.getState().assets.data,
  proxyFunction: (...args) => rpc.assetsApi(...args),
})

const rpc = createRPC({
  onData,
  serialize,
  deserialize,
})

// use serialize and deserialize for messaging with the background process
```
