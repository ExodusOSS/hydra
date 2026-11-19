# @exodus/domain-serialization

Provides Exodus-specific serialization for complex domain objects, such as those in [@exodus/models](../models/README.md) and [assets](https://github.com/ExodusMovement/assets). To plain JSON and back. In multi-process wallet applications, use this package to transfer such objects over the wire or process boundaries.

# Table of Contents

- [Install](#install)
- [Usage](#usage)
  - [Multi-process communication](#multi-process-communication)
    - [UI thread](#ui-thread)
    - [Background thread](#background-thread)

## Install

```sh
pnpm add @exodus/domain-serialization
```

## Usage

Instantiate serialization handlers with sensible defaults using the `createDomainSerialization` function. If needed, you pass in custom serializers and exclude certain assets.

```js
import createDomainSerialization from '@exodus/domain-serialization'

const { serialize, deserialize } = createDomainSerialization()

// Use serialize and deserialize for the desired purposes
```

### Multi-process communication

A common use case is in multi-process wallets where the UI and SDK run on separate threads. This package exports two additional convenience functions for this scenario.

#### UI thread

`createUIDomainSerialization` allows assets to be received and deserialized, but never sent.

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

#### Background thread

`createBackendDomainSerialization`, on the other hand, can serialize and send assets, but not receive them.

```js
import { createUIDomainSerialization } from '@exodus/domain-serialization'

const { serialize, deserialize } = createBackendDomainSerialization()
const rpc = createRPC({
  methods: exodus, // e.g. an instance of @exodus/headless
  serialize,
  deserialize,
})

// use serialize and deserialize for messaging with the UI process
```
