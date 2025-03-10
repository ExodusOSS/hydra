# @exodus/bip32

This package helps you work with [BIP32 keys](https://github.com/bitcoin/bips/blob/cc678718866d33e35960b4bf78a90eb5a192ad6d/bip-0032.mediawiki).

## Install

```sh
yarn add @exodus/bip32
```

## Usage

Typical usage revolves around loading a serialized BIP32 xpub, xpriv or master key, deriving child keys from it, and using the child key's publicKey/privateKey.

Example:

```js
const key = BIP32.fromXPub(
  'xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8'
)

const childKey = key.derive('m/0/0')
```

### Static Methods

#### fromMasterSeed(seed: Buffer): BIP32

Import a BIP32 key from a seed.

```js
import { fromMasterSeed } from '@exodus/bip32'

const key = fromMasterSeed(Buffer.from('000102030405060708090a0b0c0d0e0f'))
```

#### BIP32.fromXPub(base58xpub: string): BIP32

Import a BIP32 key from an extended public key.

```js
import BIP32 from '@exodus/bip32'

const key = BIP32.fromXPub(
  'xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8'
)
```

#### BIP32.fromXPriv(base58xpriv: string): BIP32

Import a BIP32 key from an extended private key.

```js
import BIP32 from '@exodus/bip32'

const key = BIP32.fromXPub(
  'xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi'
)
```

### Constants

#### HARDENED_OFFSET: number

Constant offset value for hardened derivation indices.

```js
import { HARDENED_OFFSET } from '@exodus/bip32'

console.log(HARDENED_OFFSET) // 0x80000000
```

### Instance Methods

#### derive(numOrPath): BIP32

Derives a child key. Example:

```js
const childKey = masterKey.derive(`m/0'/0'`)
```

#### wipePrivateData(): void

⚠️ **Warning:** destructive

Wipes all private key data from the instance.

#### toJSON(): { xpriv: string, xpub: string }

⚠️ **Warning:** returns sensitive xpriv data.

Converts the instance to a JSON object.

#### inspect(): { xpriv: string, xpub: string }

Alias to [toJSON()](#tojson--xpriv-string-xpub-string-).

#### toString(): string

⚠️ **Warning:** returns sensitive xpriv data.

Returns a stringified version of the instance.

### Instance Properties

#### privateKey: Buffer

Returns the private key.

#### publicKey: Buffer

Returns the public key.

#### chainCode: Buffer

Returns the chain code.

#### xPub: string

Returns the extended public key (xpub) in Base58 format.

#### identifier: Buffer

Returns the [key identifier](https://github.com/bitcoin/bips/blob/cc678718866d33e35960b4bf78a90eb5a192ad6d/bip-0032.mediawiki#key-identifiers) (hash160 of the public key).

#### fingerprint: number

Returns the fingerprint of the key (first 4 bytes of the identifier). See [spec](https://github.com/bitcoin/bips/blob/cc678718866d33e35960b4bf78a90eb5a192ad6d/bip-0032.mediawiki#key-identifiers).
