import { assets } from './fixtures/assets.js'
import {
  buildDerivationPath,
  DerivationPath,
  isValidDerivationPath,
  parseDerivationPath,
} from '../src/derivation-path.js'
import { HARDENED_OFFSET } from '@exodus/bip32'

const INCORRECT_PATHS = [
  Buffer.from('failure'),
  'failure',
  0,
  null,
  undefined,
  true,
  'm/',
  '1/1',
  '////',
  "'''",
  `m/0'/0'/`,
  `/m/0'/0'`,
  `m/0'a/0'`,
  `m/a0'`,
  `m/0/0'`,
]

describe('derivationPath', () => {
  describe('isValidDerivationPath()', () => {
    it.each([`m/0'/0'`, `m/23456/789/0`])('%s should validate correctly', (success) => {
      expect(isValidDerivationPath(success)).toBe(true)
    })

    it.each(INCORRECT_PATHS)('%s should throw when passing invalid input', (failure) => {
      expect(isValidDerivationPath(failure)).toBe(false)
    })

    it.each([`m/0'/0'`])('%s should not throw because correctly hardened', (success) => {
      expect(isValidDerivationPath(success, true)).toBe(true)
    })

    it.each([`m/0/0`])('%s should throw because incorrect hardened', (failure) => {
      expect(isValidDerivationPath(failure, true)).toBe(false)
    })
  })

  describe('parseDerivationPath()', () => {
    it('should parse an account path correctly', () => {
      const parsed = parseDerivationPath(`m/44'/501'/0'`)
      expect(parsed).toBeInstanceOf(Object)
      expect(parsed).toEqual({
        purpose: 44,
        coinIndex: 501,
        accountIndex: 0,
      })
    })

    it('should parse an address path correctly', () => {
      const parsed = parseDerivationPath(`m/44'/501'/0'/1/2`)
      expect(parsed).toBeInstanceOf(Object)
      expect(parsed).toEqual({
        purpose: 44,
        coinIndex: 501,
        accountIndex: 0,
        chainIndex: 1,
        addressIndex: 2,
      })
    })

    it('should handle hardened chainIndex and addressIndex correctly', () => {
      const parsed = parseDerivationPath(`m/44'/501'/0'/1'/2'`)
      expect(parsed).toBeInstanceOf(Object)
      expect(parsed).toEqual({
        purpose: 44,
        coinIndex: 501,
        accountIndex: 0,
        chainIndex: 1,
        addressIndex: 2,
      })
    })

    it('should handle hardened chainIndex and addressIndex correctly when they are 0', () => {
      const parsed = parseDerivationPath(`m/44'/501'/0'/0'/0'`)
      expect(parsed).toBeInstanceOf(Object)
      expect(parsed).toEqual({
        purpose: 44,
        coinIndex: 501,
        accountIndex: 0,
        chainIndex: 0,
        addressIndex: 0,
      })
    })

    it('should throw when passing invalid input', () => {
      const failures = [Buffer.from('failure'), 'failure', 0, null, undefined, true]
      failures.forEach((failure) => {
        expect(() => parseDerivationPath(failure)).toThrow()
      })
    })
  })

  describe('buildDerivationPath()', () => {
    it('should build correctly', () => {
      const path = buildDerivationPath({
        bip44: assets.solana.bip44,
        purpose: 44,
        accountIndex: 0,
        chainIndex: 0,
        addressIndex: 0,
      })
      expect(path).toBe(`m/44'/501'/0'/0/0`)
    })

    it('should build xpub paths correctly', () => {
      const path = buildDerivationPath({
        derivationAlgorithm: 'SLIP10',
        purpose: 44,
        bip44: assets.solana.bip44,
        accountIndex: 0,
      })
      expect(path).toBe(`m/44'/501'/0'`)
    })

    it('should throw when passing invalid input', () => {
      expect(() =>
        buildDerivationPath({
          derivationAlgorithm: 'SLIP10',
          purpose: 44,
          bip44: assets.solana.bip44,
          accountIndex: 0,
          chainIndex: 0,
          addressIndex: '123/456',
        })
      ).toThrow()
    })
  })
})

describe('DerivationPath class', () => {
  describe('from()', () => {
    const CASES = [
      { input: "m/44'/501'/0'", expected: "m/44'/501'/0'" },
      { input: 'm/44/22/0', expected: 'm/44/22/0' },
      { input: ['m', "44'", "501'", "0'"], expected: "m/44'/501'/0'" },
    ]

    test.each(CASES)('parses $input', ({ input, expected }) => {
      const derivationPath = DerivationPath.from(input)
      expect(derivationPath.toString()).toBe(expected)
    })

    test.each(INCORRECT_PATHS)('throws when parsing %s', (failure) => {
      expect(() => DerivationPath.from(failure)).toThrow()
    })
  })

  describe('extend()', () => {
    let derivationPath

    beforeEach(() => {
      derivationPath = DerivationPath.from("m/86'/0'")
    })

    test('extends with string path', () => {
      expect(derivationPath.extend('0/1').toString()).toBe("m/86'/0'/0/1")
    })

    test('extends with index array', () => {
      expect(derivationPath.extend([0, 1]).toString()).toBe("m/86'/0'/0/1")
    })

    test('extends with index array of element using the hardening char', () => {
      expect(derivationPath.extend(["0'", 42]).toString()).toBe("m/86'/0'/0'/42")
    })

    test('extends with index array of element using hardening offset', () => {
      expect(derivationPath.extend([1 + HARDENED_OFFSET, 42]).toString()).toBe("m/86'/0'/1'/42")
    })

    test('throws on receiving "m" index', () => {
      expect(() => derivationPath.extend(['m'])).toThrow(
        'Cannot extend with a partial path that starts at master ("m")'
      )
    })
  })

  describe('at', () => {
    const derivationPath = DerivationPath.from("m/44'/501'/0'")

    test('returns value at index', () => {
      expect(derivationPath.at(0)).toBe(2_147_483_692)
    })

    test('returns unhardened value at index if specified', () => {
      expect(derivationPath.at(0, { unhardened: true })).toBe(44)
    })

    test('throws when index is out of bounds', () => {
      expect(() => derivationPath.at(42)).toThrow('index 42 does not exist. Path length is 3')
    })
  })

  describe('replaceAtIndex', () => {
    let derivationPath

    beforeEach(() => {
      derivationPath = DerivationPath.from("m/44'/62'/0/0")
    })

    test('replaces value with index', () => {
      expect(derivationPath.replaceAtIndex(3, 1).toString()).toBe("m/44'/62'/0/1")
    })

    test('replaces value with hardened index', () => {
      expect(derivationPath.replaceAtIndex(1, "68'").toString()).toBe("m/44'/68'/0/0")
    })

    test('throws when trying to insert non-hardened index before hardened', () => {
      expect(() => derivationPath.replaceAtIndex(0, 42)).toThrow(
        'derivationPath may not contain hardened index after any unhardened indexes'
      )
    })

    test('throws when inserting out of bounds', () => {
      expect(() => derivationPath.replaceAtIndex(4, 42)).toThrow(
        'Index 4 does not exist, consider extending the path instead of replacing'
      )
    })
  })

  describe('constructor', () => {
    test('creates path', () => {
      expect(new DerivationPath([44, 15, 20, 1]).toString()).toBe('m/44/15/20/1')
    })

    test('creates path with hardened indices', () => {
      expect(new DerivationPath([44 + HARDENED_OFFSET, 15, 20, 1]).toString()).toBe("m/44'/15/20/1")
    })
  })

  describe('JSON.stringify()', () => {
    test('stringifies to string', () => {
      expect(JSON.stringify(DerivationPath.from('m/44/22'))).toBe('"m/44/22"')
    })
  })
})
