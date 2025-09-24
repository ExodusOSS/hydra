# `@exodus/keychain`

The keychain is a module designed to work more securely with private key material. It can be compared with a walled garden from which private keys should not escape. All operations using private keys, such as signing and encryption data should be executed within the module, with `KeyIdentifier`s used to specify which key to use for which operation. Notice the "should," as we're not quite there yet.

In its current state, this library aims to provide a good interface for working with cryptographic material. However, it has some security limitations, which are on our roadmap to address:

- Private key material is passed directly to asset libraries which can contain code by third party developers. This is on our roadmap to eliminate by refactoring asset libraries to accept signing functions instead of keys.
- Private keys _can_ be exported, via `keychain.exportKey`
- `keychain.removeAllSeeds()` does not guarantee that private keys get completely cleared from memory

## Install

```
yarn add @exodus/keychain
```

## Usage

See examples in [./modules/\_\_tests\_\_/example.test.js](./module/__tests__/example.test.js).

### Documented Usage Paths

Check [here](https://github.com/ExodusMovement/exodus-desktop/tree/master/src/app/_local_modules/constants/bip43#documented-usage-paths)

### Create A Key Identifier

In order to interact with a private key, you must first specify how it's accessed. A `KeyIdentifier` must be created, for assets there is a helpful `KeyIdentifier` class that will do the heavy lifting.

```js
import KeyIdentifier from '@exodus/key-identifier'

const keyId = new KeyIdentifier({
  assetName: 'solana',
  derivationAlgorithm: 'BIP32',
  derivationPath: "m/44'/501'/0'/0/0",
  keyType: 'nacl',
})
```

### Seed Identifier

Because the keychain supports managing multiple seeds at once, most operations require passing in a seed identifier (`seedId`) in addition to a `KeyIdentifier`. A `seedId` is a hex-encoded BIP32 identifier of seed's master key (see [./module/crypto/seed-id.js](./module/crypto/seed-id.js)).

### Adding/Removing Seeds

Before you can perform keychain operations, you must provide it one or more `seed`s via `keychain.addSeed(seed)`. Calling `keychain.removeAllSeeds()` will remove all previously added seeds and any derived cryptographic material from its internal fields.

```js
const seed = await mnemonicToSeed({
  mnemonic: 'menu memory fury language physical wonder dog valid smart edge decrease worth',
})

keychain.addSeed(seed)
keychain.addSeed(secondSeed)
keychain.addSeed(thirdSeed)
// ...
keychain.removeAllSeeds()
```

### Sign a transaction

The function `keychain.signTx(...)` is deprecated.

Use `keychain.signBuffer(...)` to sign serialized transactions for a given key identifier.

```js
import { mnemonicToSeed } from '@exodus/bip39'
import keychainDefinition, { KeyIdentifier } from '..'

const keyId = new KeyIdentifier({
  assetName: 'solana',
  derivationAlgorithm: 'BIP32',
  derivationPath: "m/44'/501'/0'/0/0",
  keyType: 'nacl',
})

const DATA =
  '010001033c8939b872876416b1ba97d04c6a31211e39258a82d0fa45542a1cccc2617d2f2c2e85e395109a73ab754dfdad48d2cdefae040d4653228245df6fe6b6d24f7300000000000000000000000000000000000000000000000000000000000000004f968728ba006a647883abdd1b8eabde24e181c8bb8e769256f9a37e73b8727901020200010c02000000b4ebad0200000000'

const result = await keychain.signBuffer({
  seedId,
  keyId,
  signatureType: 'ed25519',
  data: Buffer.from(DATA, 'hex'),
})

// result.toString('hex') === '810cdc7d804dcfab90147e50c40b0afe1f9d01fa6933739032d761f7fca4226389d348d70478560845ae9e90a940ef4173e17690b9d93122aadd56fa56b8b609'
```

### Encrypt/Decrypt Data

Note: the below follow libsodium terminology for `encryptSecretBox`/`encryptBox`/`encryptSealedBox`.

#### encryptSecretBox/decryptSecretBox

```js
const ALICE_KEY = new KeyIdentifier({
  derivationAlgorithm: 'SLIP10',
  derivationPath: `m/0'/2'/0'`,
  keyType: 'nacl',
})

const sodiumEncryptor = keychain.createSodiumEncryptor(ALICE_KEY)
const plaintext = 'I really love keychains'
const ciphertext = await sodiumEncryptor.encryptSecretBox({
  seedId,
  data: plaintext,
})

const decrypted = await sodiumEncryptor.decryptSecretBox({
  seedId,
  data: ciphertext,
})

// decrypted.toString() === plaintext
```

#### encryptBox/decryptBox

```js
const aliceSodiumEncryptor = keychain.createSodiumEncryptor(ALICE_KEY)
const bobSodiumEncryptor = keychain.createSodiumEncryptor(BOB_KEY)
const plaintext = 'I really love keychains'
const {
  box: { publicKey: bobPublicKey },
} = await bobSodiumEncryptor.getSodiumKeysFromSeed({ seedId })
const ciphertext = await aliceSodiumEncryptor.encryptBox({
  seedId,
  data: plaintext,
  toPublicKey: bobPublicKey,
})
const {
  box: { publicKey: alicePublicKey },
} = await aliceSodiumEncryptor.getSodiumKeysFromSeed({ seedId })

const decrypted = await bobSodiumEncryptor.decryptBox({
  seedId,
  data: ciphertext,
  fromPublicKey: alicePublicKey,
})

// decrypted.toString() === plaintext
```

#### encryptSealedBox/decryptSealedBox

```js
const aliceSodiumEncryptor = keychain.createSodiumEncryptor(ALICE_KEY)
const bobSodiumEncryptor = keychain.createSodiumEncryptor(BOB_KEY)
const plaintext = 'I really love keychains'
const {
  box: { publicKey: bobPublicKey },
} = await bobSodiumEncryptor.getSodiumKeysFromSeed({ seedId })

const ciphertext = await aliceSodiumEncryptor.encryptSealedBox({
  seedId,
  data: plaintext,
  toPublicKey: bobPublicKey,
})

const decrypted = await bobSodiumEncryptor.decryptSealedBox({
  seedId,
  data: ciphertext,
})

// decrypted.toString() === plaintext
```

### Export A Key

Export public and/or private key material.

```js
// { xpub, publicKey }
const publicKey = await keychain.exportKey({ seedId, keyId })
// { xpub, xpriv, publicKey, privateKey }
const privateKey = await keychain.exportKey({ seedId, keyId, exportPrivate: true })
```

### Clone the Keychain Instance

Clone the keychain, _minus any cryptographic material_. This is equivalent to re-invoking the keychain factory with the same parameters.

### secp256k1 signer

Sign a buffer using ECDSA with curve `secp256k1`.

```js
const keyId = new KeyIdentifier({
  derivationAlgorithm: 'SLIP10',
  derivationPath: `m/73'/2'/0'`,
  keyType: 'nacl',
})

const signer = keychain.createSecp256k1Signer(keyId)
const plaintext = Buffer.from('I really love keychains')
const signature = await signer.signBuffer({ seedId, data: plaintext })
```

### ed25519 signer

Sign a buffer using EdDSA with curve `ed25519`.

```js
const keyId = new KeyIdentifier({
  derivationAlgorithm: 'SLIP10',
  derivationPath: `m/73'/2'/0'`,
  keyType: 'nacl',
})

const signer = keychain.createEd25519Signer(keyId)
const plaintext = Buffer.from('I really love keychains')
const signature = await signer.signBuffer({ seedId, data: plaintext })
```
