# @exodus/browser-extension-adapters

Storage adapters for use in browser extensions.

## /unsafe-storage

Unsafe = no encryption built in. Conforms to [`@exodus/storage-spec`](../../adapters/storage-spec).

```js
import createUnsafeStorage from '@exodus/browser-extension-adapters/unsafe-storage'

const storage = createUnsafeStorage({ store: chrome.storage.local })
// use as any other `@exodus/storage-spec` compliant interface
```

## /encrypted-storage

Returns an instance of [@exodus/storage-encrypted](../../adapters/storage-encrypted), which you must unlock with a pair of encrypt/decrypt functions before use.

```js
import createUnsafeStorage from '@exodus/browser-extension-adapters/unsafe-storage'
import createEncryptedStorage from '@exodus/browser-extension-adapters/encrypted-storage'

const unsafeStorage = createUnsafeStorage({ store: chrome.storage.local })
const encryptedStorage = createEncryptedStorage({ unsafeStorage })
// use encryptedStorage as any other `@exodus/storage-spec` compliant interface
```

## /seco-storage

Departs slightly from [`@exodus/storage-spec`](../../adapters/storage-spec) to accept a `{ passphrase }` option in get() and set(), facilitating encryption with [secure-container](../../libraries/secure-container).

```js
import createUnsafeStorage from '@exodus/browser-extension-adapters/unsafe-storage'
import createSecoStorage from '@exodus/browser-extension-adapters/seco-storage'

const seedStorage = createSecoStorage({
  storage: unsafeStorage,
  appVersion: '<your app version, e.g. 1.2.3>',
})

seedStorage.set('key', 'value', { passphrase: 'a really good passphrase' })
```

## /session-storage

Conforms to [`@exodus/storage-spec`](../../adapters/storage-spec). Returns an in-memory storage if `store` is not provided.

```js
import createSessionStorage from '@exodus/browser-extension-adapters/session-storage'

// falls back to in-memory storage if chrome.storage.session is unavailable
const storage = createSessionStorage({ store: chrome.storage.session })
```
