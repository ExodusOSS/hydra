import {
  assertKeyIdentifierParameters,
  createGetKeyIdentifier,
  isSafeNonNegativeInteger,
  isSafeObject,
} from '../src/key-identifier.js'
import { assets } from './fixtures/assets.js'

describe('key-identifier', () => {
  describe('isSafeObject', () => {
    it.each([
      [false, 'null', null],
      [false, 'undefined', undefined],
      [false, 'array', [1, 2, 3]],
      [false, 'number', 1],
      [false, 'string', 'abc'],
      [true, 'object', { name: 'Bruce Wayne' }],
    ])('should return %s for %s', (expected, _, value) => {
      expect(isSafeObject(value)).toEqual(expected)
    })
  })

  describe('isSafeNonNegativeInteger', () => {
    it.each([
      [false, 'null', null],
      [false, 'undefined', undefined],
      [false, 'array', [1, 2, 3]],
      [false, 'decimal number', 1.2],
      [false, 'negative int', -1],
      [false, 'string', 'abc'],
      [false, 'object', { name: 'Bruce Wayne' }],
      [true, 'int', 42],
    ])('should return %s for %s', (expected, _, value) => {
      expect(isSafeNonNegativeInteger(value)).toEqual(expected)
    })
  })

  describe('assertKeyIdentifierParameters', () => {
    const defaults = { purpose: 44, accountIndex: 0, addressIndex: 0, chainIndex: 0 }

    it('should throw if first argument is not an object ', () => {
      expect(() => assertKeyIdentifierParameters(null)).toThrow(
        'arguments for getKeyIdentifier were not an object'
      )
    })

    it('should throw if rules are not an object ', () => {
      expect(() => assertKeyIdentifierParameters(defaults, 2)).toThrow(
        'rules for getKeyIdentifier were not an object'
      )
    })

    it('should throw if allowedPurposes is not an array ', () => {
      expect(() => assertKeyIdentifierParameters(defaults, { allowedPurposes: 44 })).toThrow(
        'rules.allowedPurposes has to be an array'
      )
    })

    it('should throw for unexpected account index', () => {
      expect(() => assertKeyIdentifierParameters({ ...defaults, accountIndex: -1 })).toThrow(
        'accountIndex must be a non-negative integer'
      )
    })

    it('should throw for unexpected chain index', () => {
      expect(() => assertKeyIdentifierParameters({ ...defaults, chainIndex: -1 })).toThrow(
        'chainIndex must be a non-negative integer'
      )
    })

    it('should throw if chain index is 1', () => {
      expect(() => assertKeyIdentifierParameters({ ...defaults, chainIndex: 1 })).toThrow(
        'setting chainIndex to value other than 0 is not supported'
      )
    })

    it('should allow other chain-index if contained in allowedChainIndices', () => {
      expect(() =>
        assertKeyIdentifierParameters(
          { ...defaults, chainIndex: 1 },
          {
            allowedChainIndices: [0, 1],
          }
        )
      ).not.toThrow()
    })

    it.each([[84], [86], [44]])('should allow whitelisted purpose %s', (purpose) => {
      expect(() =>
        assertKeyIdentifierParameters(
          { ...defaults, purpose },
          {
            allowedPurposes: [44, 84, 86],
          }
        )
      ).not.toThrow()
    })

    it('should allow purpose 44 by default', () => {
      expect(() => assertKeyIdentifierParameters({ ...defaults, purpose: 44 })).not.toThrow()
    })

    it('should throw if purpose not whitelisted', () => {
      expect(() =>
        assertKeyIdentifierParameters(
          { ...defaults, purpose: 84 },
          {
            allowedPurposes: [44],
          }
        )
      ).toThrow('purpose was 84, which is not allowed. Can be one of the following: 44')
    })

    it('should throw for wrong type compatibility mode', () => {
      expect(() =>
        assertKeyIdentifierParameters(
          { ...defaults, compatibilityMode: 1337 },
          {
            allowNonZeroChainIndex: true,
          }
        )
      ).toThrow(/compatibilityMode, if defined, must be a string/)
    })

    it.each([['metamask'], ['trezor'], ['phantom'], [undefined], [null]])(
      'should allow compatibility mode %s',
      (compatibilityMode) => {
        expect(() =>
          assertKeyIdentifierParameters(
            { ...defaults, compatibilityMode },
            {
              allowNonZeroChainIndex: true,
            }
          )
        ).not.toThrow()
      }
    )

    it('should throw if not supplying addressIndex & chainIndex with allowXPUB off', () => {
      expect(() =>
        assertKeyIdentifierParameters(
          { ...defaults, addressIndex: undefined },
          {
            allowXPUB: false,
          }
        )
      ).toThrow()

      expect(() =>
        assertKeyIdentifierParameters(
          { ...defaults, chainIndex: undefined },
          {
            allowXPUB: false,
          }
        )
      ).toThrow()

      expect(() =>
        assertKeyIdentifierParameters(
          { ...defaults, addressIndex: undefined, chainIndex: undefined },
          {
            allowXPUB: false,
          }
        )
      ).toThrow()
    })

    it('should throw if supplying wrong addressIndex with allowMultipleAddresses', () => {
      expect(() =>
        assertKeyIdentifierParameters(
          { ...defaults, addressIndex: 1 },
          {
            allowMultipleAddresses: false,
          }
        )
      ).toThrow()

      expect(() =>
        assertKeyIdentifierParameters(
          { ...defaults, addressIndex: 1 },
          {
            allowMultipleAddresses: true,
          }
        )
      ).not.toThrow()
    })
  })

  describe('createGetKeyIdentifier', () => {
    it('should create a key identifier', () => {
      const getKeyIdentifier = createGetKeyIdentifier({ bip44: assets.solana.bip44 })
      expect(
        getKeyIdentifier({ purpose: 44, accountIndex: 1, chainIndex: 0, addressIndex: 0 })
      ).toEqual({
        derivationAlgorithm: 'BIP32',
        derivationPath: "m/44'/501'/1'/0/0",
        keyType: 'secp256k1',
      })
    })

    it('should create a key identifier with chainIndex 1', () => {
      const getKeyIdentifier = createGetKeyIdentifier({
        bip44: assets.solana.bip44,
        validationRules: { allowedChainIndices: [0, 1] },
      })
      expect(
        getKeyIdentifier({ purpose: 44, accountIndex: 1, chainIndex: 1, addressIndex: 0 })
      ).toEqual({
        derivationAlgorithm: 'BIP32',
        derivationPath: "m/44'/501'/1'/1/0",
        keyType: 'secp256k1',
      })
    })

    it('should harden chain and address index when algorithm is SLIP10', () => {
      const getKeyIdentifier = createGetKeyIdentifier({
        bip44: assets.solana.bip44,
        derivationAlgorithm: 'SLIP10',
        keyType: 'nacl',
        validationRules: { allowedChainIndices: [0, 1] },
      })
      expect(
        getKeyIdentifier({ purpose: 44, accountIndex: 1, chainIndex: 1, addressIndex: 0 })
      ).toEqual({
        derivationAlgorithm: 'SLIP10',
        derivationPath: "m/44'/501'/1'/1'/0'",
        keyType: 'nacl',
      })
    })

    it('should throw for chainIndex 1 with default allowedChainIndices', () => {
      const getKeyIdentifier = createGetKeyIdentifier({
        bip44: assets.solana.bip44,
      })

      expect(() =>
        getKeyIdentifier({ purpose: 44, accountIndex: 1, chainIndex: 1, addressIndex: 4 })
      ).toThrow()
    })

    it('should work with missing chainIndex with allowXPUB (Phantom)', () => {
      const getKeyIdentifier = createGetKeyIdentifier({
        bip44: assets.solana.bip44,
        validationRules: {
          allowXPUB: true,
        },
      })
      expect(getKeyIdentifier({ purpose: 44, accountIndex: 1, addressIndex: 0 })).toEqual({
        derivationAlgorithm: 'BIP32',
        derivationPath: "m/44'/501'/1'/0",
        keyType: 'secp256k1',
      })
    })

    it('should work to derive XPUBs', () => {
      const getKeyIdentifier = createGetKeyIdentifier({
        bip44: assets.solana.bip44,
        validationRules: {
          allowXPUB: true,
        },
      })
      expect(getKeyIdentifier({ purpose: 44, accountIndex: 1 })).toEqual({
        derivationAlgorithm: 'BIP32',
        derivationPath: "m/44'/501'/1'",
        keyType: 'secp256k1',
      })
    })

    it('should allow deriving XPUBs by default for BIP32/secp256k1', () => {
      const getKeyIdentifier = createGetKeyIdentifier({
        bip44: assets.bitcoin.bip44,
      })
      expect(getKeyIdentifier({ purpose: 44, accountIndex: 1 })).toEqual({
        derivationAlgorithm: 'BIP32',
        derivationPath: "m/44'/0'/1'",
        keyType: 'secp256k1',
      })
    })

    it('should reject deriving XPUBs by default if not BIP32 & secp256k1', () => {
      const getKeyIdentifier = createGetKeyIdentifier({
        bip44: assets.solana.bip44,
        derivationAlgorithm: 'SLIP10',
        keyType: 'nacl',
      })
      expect(() => getKeyIdentifier({ purpose: 44, accountIndex: 1 })).toThrow(/XPUB/)
    })
  })
})
