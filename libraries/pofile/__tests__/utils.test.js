const { createEntryId, parseEntryId } = require('../src/utils')

describe('createEntryId', () => {
  it('should throw an error if id is not a string', () => {
    expect(() => createEntryId({ id: 1 })).toThrowError(
      'pofile: entry id must be a string. Got number'
    )
  })

  it('should throw an error if id is an empty string', () => {
    expect(() => createEntryId({ id: '' })).toThrowError(
      'pofile: entry id must be a non-empty string'
    )
  })

  it('should return the id if context is not provided', () => {
    expect(createEntryId({ id: 'id' })).toBe('id')
  })

  it('should return the id with the context if provided', () => {
    expect(createEntryId({ id: 'id', context: 'context' })).toBe(`id::context`)
  })

  it('should return the id with the context if provided with whitespace', () => {
    expect(createEntryId({ id: 'id', context: ' context ' })).toBe('id::context')
  })
})

describe('parseEntryId', () => {
  it('should return an object with id and context', () => {
    expect(parseEntryId('id::context')).toEqual({ id: 'id', context: 'context' })
  })

  it('should return an object with id and empty context', () => {
    expect(parseEntryId('id')).toEqual({ id: 'id', context: undefined })
  })
})
