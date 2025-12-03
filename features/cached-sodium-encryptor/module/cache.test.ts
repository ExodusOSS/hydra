import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

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
    // eslint-disable-next-line sonarjs/no-base-to-string
    test(`computes cache key for ${new KeyIdentifier(keyId).toString()}`, () => {
      const cacheKey = getCacheKey({ keyId, seedId })
      assert.equal(cacheKey, expected)
    })
  }
})
