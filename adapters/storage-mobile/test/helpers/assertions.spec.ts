import { assertValidFilesystemKey } from '../../src/helpers/assertions.js'

describe('assertions', () => {
  describe('assertValidFilesystemKey', () => {
    const valid = [
      'my-key',
      'ABCDEFGHIKLMNOPQRSTUVWXY_TEST',
      'U1lOQ19LRVk=',
      'd41d8cd98f00b204e9800998ecf8427e',
      'da39a3ee5e6b4b0d3255bfef95601890afd80709',
    ]
    const invalid = [
      '../root',
      './',
      '/',
      'spaced key',
      'a/relative/path',
      '/an/absolute/path',
      '%u002e%u002e',
      '%2e%2e',
      '%c0%2e, %e0%40%ae, %c0ae',
    ]

    valid.forEach((key) => {
      it(`should allow key ${key}`, () => {
        expect(() => assertValidFilesystemKey(key)).not.toThrow()
      })
    })

    invalid.forEach((key) => {
      it(`should throw for key ${key}`, () => {
        expect(() => assertValidFilesystemKey(key)).toThrow()
      })
    })
  })
})
