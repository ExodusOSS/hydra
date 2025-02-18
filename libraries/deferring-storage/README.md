# @exodus/deferring-storage

## Usage

Wraps a storage to defers access besides clearing or deleting until it is released.
Can be used to replicate the behavior of the encrypted storage in platforms that don't use the encrypted storage.

```js
// adapters.js

const createUnlockableStorage = (storage) => {
  const deferringStorage = createDeferringStorage(storage)
  return {
    ...deferringStorage,
    unlock: () => deferringStorage.release(),
  }
}

const createAdapters = () => {
  const storage = createUnlockableStorage(storage)
  const migrateableStorage = createUnlockableStorage(storage)

  return {
    storage,
    migrateableStorage,
  }
}
```
