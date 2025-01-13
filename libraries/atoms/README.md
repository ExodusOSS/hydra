# `@exodus/atoms`

## Install

```sh
    yarn add @exodus/atoms
```

## What is an atom?

An atom is a data source wrapper that exposes a single piece of data through 3 different methods:

- **get()**: read data
- **set(newValue)**: write data
- **observe(async (data) => {})**: observes data changes. Will be called initially with current data value. Observers are awaited in series.
- **reset()**: clear the stored value. The next `get()` call will return the default value\* and observers will be called with the default value.

## Data sources

This library provides helpers for creating atoms from multiple data sources we use in our apps

|               | get   | set     | observe |
| ------------- | ----- | ------- | ------- |
| Memory        | ✅ \* | ✅      | ✅      |
| Storage       | ✅    | 🟡 \*\* | ✅      |
| Remote config | ✅    | ❌      | ✅      |
| Local config  | ✅    | ✅      | ✅      |
| Event emitter | ✅    | ❌      | ✅      |

\* If no `defaultValue` is provided, a memory atom's `get()` method will hang and observers will NOT be called until the first `set()` call.

\*\* A storage atom needs a special `isSoleWriter` param to allow write access. This is because storage instances can overlap, e.g. a parent namespace can mutate a child namespace, and our [storage-spec](https://github.com/ExodusMovement/exodus-hydra/tree/master/modules/storage-spec) doesn't currently provide for detecting changes across those instances.

## Usage

```js
import { createInMemoryAtom, createStorageAtomFactory, fromEventEmitter } from '@exodus/atoms'

// In memory atoms
const availableAssetNamesAtom = createInMemoryAtom({
  defaultValue: {},
})

// Storage atoms
const storageAtomFactory = createStorageAtomFactory({ storage })

const acceptedTermsAtom = storageAtomFactory({
  key: 'acceptedTerms',
  defaultValue: false,
  isSoleWriter: true,
})

// Event emitter
const geolocationAtom = fromEventEmitter({
  emitter: geolocation,
  event: 'geolocation',
  get: geolocation.get,
})
```

## Helper functions

### compute({ atom, selector })

Computes an atom from another by applying a selector function to the observed data source. Returned atom is read-only, i.e. **set** will fail.

### withSerialization({ atom, serialize, deserialize })

Computes an atom from another by serializing it's data after reading it and deserializing it before writing it.
