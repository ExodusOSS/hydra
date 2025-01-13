# SLIP10

This package is a helper module for dealing with [SLIP10 keys](https://github.com/satoshilabs/slips/blob/master/slip-0010.md).

**Note: at the moment this only supports the curve Ed25519.**

## Install

```
yarn add @exodus/slip10
```

## Usage

### SLIP10.fromSeed(seed: Buffer | Uint8Array)

Create a master key from a seed

```js
import SLIP10 from '@exodus/slip10'

const seed = Buffer.from(
  'fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542',
  'hex'
)

const key = SLIP10.fromSeed(seed)
// `key` is an instance of SLIP10
```

### SLIP10.fromXPriv({ private, chainCode })

Import an SLIP10 key from an extended private key, as exported by [key.toJSON()](#keytojson).

```js
import SLIP10 from '@exodus/slip10'

const key = SLIP10.fromXPriv({
  chainCode: '5d70af781f3a37b829f0d060924d5e960bdc02e85423494afc0b1a41bbe196d4',
  private: '551d333177df541ad876a60ea71f00447931c0a9da16f227c11ea080d7391b8d',
})

// `key` is an instance of SLIP10
```

### key.derive(path: string)

```js
const childKey = key.derive(`m/0'/0'`)
// `childKey` is an instance of SLIP10
```

### key.privateKey

Getter for the private key Buffer.

```js
const { privateKey } = key
```

### key.publicKey

Getter for the public key Buffer.

```js
const { publicKey } = key
```

### key.toJSON()

Exports the private key data.

```js
const {
  xpriv: {
    // hex string
    key,
    // hex string
    chainCode,
  },
} = key.toJSON()
```

### key.wipePrivateData()

Wipes internal references to private key data.

```js
key.privateKey // Buffer
key.chainCode // Buffer

key.wipePrivateData()

key.privateKey // undefined
key.chainCode // undefined
```
