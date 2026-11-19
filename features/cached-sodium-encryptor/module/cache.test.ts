import { describe, test, type TestContext } from 'node:test'

import KeyIdentifier from '@exodus/key-identifier'
import { EXODUS_KEY_IDS } from '@exodus/key-ids'

import { getCacheKey } from './cache.js'

describe('getCacheKey', () => {
  const cases = [
    [{ keyId: EXODUS_KEY_IDS.FUSION, seedId: 'abc' }, "abc/nacl/SLIP10/m%2F6649967'%2F2'%2F0'"],
    [
      {
        keyId: new KeyIdentifier({
          keyType: 'secp256k1',
          assetName: 'bitcoin',
          derivationAlgorithm: 'BIP32',
          derivationPath: 'm/44/0/0',
        }),
        seedId: 'abc',
      },
      'abc/secp256k1/BIP32/m%2F44%2F0%2F0/bitcoin',
    ],
    [
      { keyId: EXODUS_KEY_IDS.FUSION.toJSON(), seedId: 'abc' },
      "abc/nacl/SLIP10/m%2F6649967'%2F2'%2F0'",
    ], // works with a key identifier like object
  ] as const

  for (const [{ keyId, seedId }, expected] of cases) {
    test(`computes cache key for ${new KeyIdentifier(keyId).toString()}`, (t: TestContext) => {
      const cacheKey = getCacheKey({ keyId, seedId })
      t.assert.equal(cacheKey, expected)
    })
  }
})
