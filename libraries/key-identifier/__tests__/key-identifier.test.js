import { createKeyIdentifierForExodus } from '@exodus/key-ids'
import { DerivationPath } from '@exodus/key-utils'

import KeyIdentifier from '../src/key-identifier.js'

describe('KeyIdentifier', () => {
  it('should fail on incorrect construction', () => {
    const failures = [
      null,
      undefined,
      Object.create(null),
      // Missing parameters

      {
        derivationAlgorithm: 'BIP32',
      },
      {
        derivationPath: "m/44'/60'/0'/0/0",
      },

      // Incorrect types
      {
        derivationAlgorithm: 'BIP32',
        assetName: 0,
        derivationPath: "m/44'/60'/0'/0/0",
      },
      // Non-existing assetNames
      // {
      //  derivationAlgorithm: 'BIP32',
      //  asset: { name: 'i-do-not-exist' },
      //  derivationPath: `m/44'/60'/0'/0/0`,
      // },
      // Incorrect paths
    ]

    const failuresAsFunctions = failures.map((failure) => () => {
      return new KeyIdentifier(failure)
    })
    failuresAsFunctions.forEach((failureFunc) => {
      expect(failureFunc).toThrow()
    })
  })

  it('validates KeyIdentifier-likes', () => {
    const valid = [
      new KeyIdentifier({
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: "m/44'/60'/0'/0/0",
      }),
      new KeyIdentifier({
        derivationAlgorithm: 'SLIP10',
        assetName: 'solana',
        derivationPath: "m/44'/501'/0'",
      }),
      {
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: "m/44'/60'/0'/0/0",
      },
      {
        derivationPath: "m/44'/1815'/0'/0/0",
        derivationAlgorithm: 'BIP32',
        keyType: 'cardanoByron',
      },
    ]

    const invalid = [
      {
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
      },
    ]

    valid.forEach((item) => expect(KeyIdentifier.validate(item)).toEqual(true))
    invalid.forEach((item) => expect(KeyIdentifier.validate(item)).toEqual(false))
  })

  it('supports passing the derivation path as array of path indices', () => {
    const keyId = new KeyIdentifier({
      derivationAlgorithm: 'BIP32',
      assetName: 'ethereum',
      derivationPath: ['m', "44'", "60'", "0'", '0', '0'],
    })

    expect(keyId.derivationPath).toBe("m/44'/60'/0'/0/0")
  })

  test('spreads all properties', () => {
    const properties = {
      assetName: 'wayne-coin',
      derivationAlgorithm: 'BIP32',
      derivationPath: "m/44'/60'/0'",
      keyType: 'secp256k1',
    }

    const keyId = new KeyIdentifier(properties)

    expect({ ...keyId }).toEqual(properties)
  })

  test('cannot write derivationPath', () => {
    const keyId = new KeyIdentifier({
      derivationAlgorithm: 'BIP32',
      assetName: 'ethereum',
      derivationPath: ['m', "44'", "60'", "0'", '0', '0'],
    })

    expect(() => {
      keyId.derivationPath = 'm/44/60/0/0/0'
    }).toThrow()
  })

  describe('getPath', () => {
    test('returns derivation path', () => {
      const keyId = new KeyIdentifier({
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: 'm/44/60/0/0/0',
      })

      const derivationPath = keyId.getPath()
      expect(derivationPath).toBeInstanceOf(DerivationPath)
      expect(derivationPath.toPathArray()).toEqual([44, 60, 0, 0, 0])
    })
  })

  describe('.extend()', () => {
    test('extends derivation path', () => {
      const keyId = new KeyIdentifier({
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: "m/44'/60'/0'",
      })

      const derived = keyId.derive([1, 5])

      expect(derived.toJSON()).toEqual({
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: "m/44'/60'/0'/1/5",
        keyType: 'secp256k1',
      })
    })
  })

  describe('.toJSON()', () => {
    test('includes derivation path', () => {
      const keyId = new KeyIdentifier({
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: "m/44'/60'/0'",
      })

      expect(keyId.toJSON()).toEqual({
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        keyType: 'secp256k1',
        derivationPath: "m/44'/60'/0'",
      })
    })
  })

  describe('.toStringTag()', () => {
    test('returns KeyIdentifier', () => {
      const keyId = new KeyIdentifier({
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: "m/44'/60'/0'",
      })

      expect(keyId[Symbol.toStringTag]).toBe('KeyIdentifier')
    })
  })

  describe('.compare()', () => {
    it('should return true when equal', () => {
      const keyIdA = new KeyIdentifier({
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: "m/44'/60'/0'/0/0",
      })

      const keyIdB = new KeyIdentifier({
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: "m/44'/60'/0'/0/0",
      })

      expect(KeyIdentifier.compare(keyIdA, keyIdB)).toBe(true)
    })

    it('should return false when not equal', () => {
      const keyIdA = new KeyIdentifier({
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: "m/44'/60'/0'/0/0",
      })

      const keyIdB = new KeyIdentifier({
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: "m/44'/60'/0'/0/1",
      })

      expect(KeyIdentifier.compare(keyIdA, keyIdB)).toBe(false)
      expect(KeyIdentifier.compare('not-an-object', keyIdB)).toBe(false)
    })

    it('should return false when key identifier A is null', () => {
      const keyIdA = new KeyIdentifier({
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: "m/44'/60'/0'/0/0",
      })

      expect(KeyIdentifier.compare(keyIdA, null)).toBe(false)
    })

    it('should return false when key identifier B is null', () => {
      const keyIdB = new KeyIdentifier({
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: "m/44'/60'/0'/0/0",
      })

      expect(KeyIdentifier.compare(null, keyIdB)).toBe(false)
    })
  })

  describe('.toString()', () => {
    it('should show derivation path and algorithm', () => {
      const keyIdentifier = new KeyIdentifier({
        derivationAlgorithm: 'SLIP10',
        assetName: 'solana',
        derivationPath: "m/44'/501'/0'",
      })

      expect(keyIdentifier.toString()).toBe("m/44'/501'/0' (SLIP10)")
    })
  })
})

describe('createKeyIdentifierForExodus', () => {
  it('should work', () => {
    expect(() => createKeyIdentifierForExodus({ exoType: 'FUSION' })).not.toThrow()
  })

  it('should throw when incorrect exoType', async () => {
    expect(() => createKeyIdentifierForExodus({ exoType: 'INVALID' })).toThrow()
  })
})
