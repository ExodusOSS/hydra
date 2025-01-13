# `@exodus/key-utils`

Utilities to manage derivation paths and key identifier aspects.

## Usage

`assertKeyIdentifierParameters` can be used to verify that `getKeyIdentifer`
is supplied with the right arguments.

```js
import { assertKeyIdentifierParameters } from '@exodus/key-utils'

export function createGetKeyIdentifier({
  bip44,
  assetName,
  derivationAlgorithm = 'BIP32',
  keyType = 'secp256k1',
}) {
  return (params = {}) => {
    params = { accountIndex: 0, addressIndex: 0, chainIndex: 0, ...params }
    assertKeyIdentifierParameters(params)

    // ...
  }
}
```

This library also comes with a `getKeyIdentifier` factory, that is configurable and should be able to fit most assets needs:

```js
const getKeyIdentifier = createGetKeyIdentifier({
  bip44: assets.solana.bip44,
  validationRules: { allowedChainIndices: [0, 1] },
})

// or for assets that support purpose 84, 86 as well
const getKeyIdentifier = createGetKeyIdentifier({
  bip44: assets.bitcoin.bip44,
  validationRules: { allowedChainIndices: [0, 1], allowedPurposes: [44, 84, 86] },
})
```
