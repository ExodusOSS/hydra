import {
  pad,
  toCamelCase,
  toFirstLower,
  toFirstUpper,
  toKebapCase,
  toPascalCase,
  toSnakeCase,
  toUpperSnakeCase,
  truncate,
  truncateMiddle,
} from './strings.js'

describe('strings', () => {
  describe('toCamelCase', () => {
    it.each([
      ['kebap-case', 'kebapCase'],
      ['#kebap-#$case', 'kebapCase'],
      ['spaced stuff', 'spacedStuff'],
      ['snake_case', 'snakeCase'],
      ['camelCase', 'camelCase'],
      ['PascalCase', 'pascalCase'],
    ])('should transform %s to %s', (input, expected) => {
      expect(toCamelCase(input)).toEqual(expected)
    })
  })

  describe('toKebapCase', () => {
    it.each([
      ['camelCase', 'camel-case'],
      ['spaced stuff', 'spaced-stuff'],
      ['snake_case', 'snake-case'],
    ])('should transform %s to %s', (input, expected) => {
      expect(toKebapCase(input)).toEqual(expected)
    })
  })

  describe('toPascalCase', () => {
    it.each([
      ['kebap-case', 'KebapCase'],
      ['spaced stuff', 'SpacedStuff'],
      ['snake_case', 'SnakeCase'],
    ])('should transform %s to %s', (input, expected) => {
      expect(toPascalCase(input)).toEqual(expected)
    })
  })

  describe('toSnakeCase', () => {
    it.each([
      ['kebap-case', 'kebap_case'],
      ['spaced stuff', 'spaced_stuff'],
      ['snake_case', 'snake_case'],
      ['with1Numbers2', 'with1_numbers2'],
      ['camelCase', 'camel_case'],
      ['PascalCase', 'pascal_case'],
    ])('should transform %s to %s', (input, expected) => {
      expect(toSnakeCase(input)).toEqual(expected)
    })
  })

  describe('toUpperSnakeCase', () => {
    it.each([
      ['kebap-case', 'KEBAP_CASE'],
      ['spaced stuff', 'SPACED_STUFF'],
      ['with1Numbers2', 'WITH1_NUMBERS2'],
      ['snake_case', 'SNAKE_CASE'],
      ['camelCase', 'CAMEL_CASE'],
      ['PascalCase', 'PASCAL_CASE'],
    ])('should transform %s to %s', (input, expected) => {
      expect(toUpperSnakeCase(input)).toEqual(expected)
    })
  })

  describe('toFirstUpper', () => {
    it.each([
      ['some-word', 'Some-word'],
      ['spaced stuff', 'Spaced stuff'],
      ['', ''],
    ])('should transform %s to %s', (input, expected) => {
      expect(toFirstUpper(input)).toEqual(expected)
    })
  })

  describe('toFirstLower', () => {
    it.each([
      ['Some-word', 'some-word'],
      ['Spaced stuff', 'spaced stuff'],
      ['', ''],
    ])('should transform %s to %s', (input, expected) => {
      expect(toFirstLower(input)).toEqual(expected)
    })
  })

  describe('pad', () => {
    it('should pad number', () => {
      expect(pad(5, { length: 4, character: 'X' })).toEqual('XXX5')
    })

    it('should pad number from end', () => {
      expect(pad(5, { length: 4, character: 'X', direction: 'end' })).toEqual('5XXX')
    })

    it('should pad string', () => {
      expect(pad('hallo', { length: 8, character: ' ' })).toEqual('   hallo')
    })

    it('should pad string from end', () => {
      expect(pad('hallo', { length: 8, character: ' ', direction: 'end' })).toEqual('hallo   ')
    })

    it('should return text when exceeding length', () => {
      expect(pad('Hallo', { length: 4, character: 'X' })).toEqual('Hallo')
    })
  })

  describe('truncate', () => {
    it('should keep full words split by punctuation', () => {
      const result = truncate(
        'chore: release networking-browser,networking-common,networking-mobile,networking-node,networking-spec',
        { maxLen: 50 }
      )
      expect(result).toEqual('chore: release networking-browser...')
    })

    it('should keep full words split by white space', () => {
      const result = truncate(
        'I am Bruce Wayne and at night I like to go out and dress differently.',
        { maxLen: 60 }
      )
      expect(result).toEqual('I am Bruce Wayne and at night I like to go out and dress...')
    })

    it('should return full text when exceeding maxLen', () => {
      const result = truncate('Hallo', { maxLen: 999 })
      expect(result).toEqual('Hallo')
    })

    it('should return ellipsis for one word that exceeds maxLen', () => {
      const result = truncate('Hallo', { maxLen: 4 })
      expect(result).toEqual('...')
    })

    it('should truncate ellipsis that exceeds maxLen', () => {
      const result = truncate('Hallo', { maxLen: 2 })
      expect(result).toEqual('..')
    })
  })

  describe('truncateMiddle', () => {
    it('should return full text when shorter than maxLen', () => {
      const result = truncateMiddle('Hallo', { maxLen: 999 })
      expect(result).toEqual('Hallo')
    })

    it('should return ellipsis in middle for input that exceeds maxLen', () => {
      const result = truncateMiddle('PotterCastsOnlyLumos', { maxLen: 10 })

      expect(result).toHaveLength(10)
      expect(result).toEqual('Pott...mos')
    })

    it('should not fail when ellipsis shorter than maxLen', () => {
      const result = truncateMiddle('Pot', { maxLen: 2 })

      expect(result).toEqual('..')
    })

    it('should not fail when ellipsis equal maxLen', () => {
      const result = truncateMiddle('Pote', { maxLen: 3 })

      expect(result).toEqual('...')
    })
  })
})
