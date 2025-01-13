# @exodus/storage-encrypted

## Usage

Adapter to wrap a storage. It encrypts values on write, and decrypts them on read.

```js
const cryptoFunctions = pDefer()

const storage = createStorageEncrypted({
  storage: storage.namespace('wayne-foundation-blueprints'),
  cryptoFunctionsPromise: cryptoFunctions.promise,
})

const { encryptSecretBox, decryptSecretBox } = keychain.createSodiumEncryptor(
  EXODUS_KEY_IDS.WALLET_INFO
)

// Crypto functions have to be resolved before the storage can be used
cryptoFunctions.resolve({
  encrypt: (data) => sodiumEncryptor.encryptSecretBox({ data }),
  decrypt: (data) => sodiumEncryptor.decryptSecretBox({ data }),
})
```
