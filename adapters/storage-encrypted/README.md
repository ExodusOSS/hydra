# @exodus/storage-encrypted

## Usage

Storage enhancer for the `@exodus/storage-spec` interface. It encrypts values on write, and decrypts them on read. To address cases where the encryption keys are available asynchronously, the enhancer accepts a promise that resolves to the encryption/decryption functions.

```js
import pDefer from 'p-defer'
import withEncryption from '@exodus/storage-encrypted'

const cryptoFunctions = pDefer()

const storage = withEncryption({
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
