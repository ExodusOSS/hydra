import { formatBytes } from './bytes.js'

describe('bytes', () => {
  describe('formatBytes', () => {
    it.each([
      [80, '80 B'],
      [1025, '1 KB'],
      [1_048_576, '1 MB'],
      [1_080_700_800, '1.01 GB'],
    ])('should format %i as %s', (bytes, expected) => {
      expect(formatBytes(bytes)).toEqual(expected)
    })
  })
})
