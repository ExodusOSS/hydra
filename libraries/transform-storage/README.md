# @exodus/transform-storage

## Usage

[storage-spec](../../adapters/storage-spec/README.md) enhancer that applies provided onRead/onWrite transformations.

```js
const storage = transformStorage({
  storage: storage.namespace('highly-secret'),
  onRead: async (ciphertext) => {
    const buffer = await decryptSecretBox({ data: Buffer.from(ciphertext, 'base64') })
    return JSON.parse(buffer.toString())
  },
  onWrite: async (value) => {
    const buffer = await encryptSecretBox({ data: JSON.stringify(value) })
    return buffer.toString('base64')
  },
})
```
