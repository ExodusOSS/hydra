import KeyIdentifier from '../src/key-identifier.js'

describe('KeyIdentifier', () => {
  it('should fail on incorrect construction', () => {
    const failures = [
      {
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        failureMessage: 'Invalid derivation path: "undefined"',
      },
      {
        derivationPath: "m/44'/60'/0'/0/0",
        assetName: 'ethereum',
        failureMessage: 'derivationAlgorithm not a string',
      },
      {
        assetName: 'ethereum',
        failureMessage: 'derivationAlgorithm not a string',
      },
      {
        derivationAlgorithm: 0,
        assetName: 'ethereum',
        derivationPath: "m/44'/60'/0'/0/0",
        failureMessage: 'derivationAlgorithm not a string',
      },
      {
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: 0,
        failureMessage: 'Invalid derivation path: "0"',
      },
      {
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: "m/44'/60'/0'/0/0dddd",
        failureMessage:
          "derivationPath must contain only a number and optionally a hardening character '",
      },
      {
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: "m\\44'/60'/0'/0/0",
        failureMessage: 'derivationPath must start with master root m',
      },
      {
        derivationAlgorithm: 'BIP32',
        assetName: 'ethereum',
        derivationPath: "m44'/60'/0'/0/0",
        failureMessage: 'derivationPath must start with master root m',
      },
    ]

    const failuresAsFunctions = failures.map(({ failureMessage, ...failure }) => ({
      // @ts-expect-error deliberately malformed params — exercises the constructor's runtime validation
      failureFunc: () => new KeyIdentifier(failure),
      failureMessage,
    }))
    failuresAsFunctions.forEach(({ failureFunc, failureMessage }) => {
      expect(failureFunc).toThrow(failureMessage)
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
  })
})
