import type { StorageFormatLegacy } from '../formats/storage/legacy.js'
import { assertStorageFormatLegacy, StorageFormatLegacyBuilder } from '../formats/storage/legacy.js'
import { hardwareWalletFixture as fixtureLegacy } from './fixture-legacy.js'

const fixture = {
  a: ['invalid'],
} as unknown as StorageFormatLegacy

describe('StorageFormatLegacy', () => {
  describe('.constructor()', () => {
    it('should not throw if valid', async () => {
      expect(() => new StorageFormatLegacyBuilder({ data: fixtureLegacy })).not.toThrow()
    })
    it('should throw if not valid', async () => {
      expect(() => new StorageFormatLegacyBuilder({ data: fixture })).toThrow()
    })
  })

  describe('.assertStorageFormatLegacy()', () => {
    it('should not throw if valid', async () => {
      expect(() => assertStorageFormatLegacy(fixtureLegacy)).not.toThrow()
    })
    it('should throw if not valid', async () => {
      expect(() => assertStorageFormatLegacy(fixture)).toThrow()
    })
  })

  describe('.deserialize()', () => {
    it('should not throw if valid', async () => {
      expect(() => StorageFormatLegacyBuilder.deserialize(fixtureLegacy)).not.toThrow()
    })
    it('should throw if not valid', async () => {
      expect(() => StorageFormatLegacyBuilder.deserialize(fixture)).toThrow()
    })
  })

  describe('.validate()', () => {
    it('should not throw if valid', async () => {
      expect(StorageFormatLegacyBuilder.validate(fixtureLegacy)).toBeTruthy()
    })
    it('should throw if not valid', async () => {
      expect(StorageFormatLegacyBuilder.validate(fixture)).toBeFalsy()
    })
  })
})
