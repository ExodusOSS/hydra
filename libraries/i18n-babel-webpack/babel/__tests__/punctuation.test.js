const extractPunctuations = require('../punctuation.js')

describe('extractPunctuations', () => {
  test('should leave string without punctuations as is', () => {
    const string = 'Welcome to Exodus'
    const result = extractPunctuations(string)

    expect(result).toMatchObject({ message: string, leading: '', trailing: '' })
  })

  test('should leave string with trailing ! as is', () => {
    const string = 'Welcome to Exodus!'
    const result = extractPunctuations(string)

    expect(result).toMatchObject({ message: 'Welcome to Exodus!', leading: '', trailing: '' })
  })

  test('should match multiple . trailing punctuation', () => {
    const string = 'Welcome to Exodus..'
    const result = extractPunctuations(string)

    expect(result).toMatchObject({ message: 'Welcome to Exodus', leading: '', trailing: '..' })
  })

  test('should match … (ellipsis) trailing punctuation', () => {
    const string = 'Welcome to Exodus…'
    const result = extractPunctuations(string)

    expect(result).toMatchObject({ message: 'Welcome to Exodus', leading: '', trailing: '…' })
  })

  test('should match ... trailing punctuation without something else', () => {
    const string = 'Welcome to Exodus!...'
    const result = extractPunctuations(string)

    expect(result).toMatchObject({ message: 'Welcome to Exodus!', leading: '', trailing: '...' })
  })

  test('should leave ¡ leading punctuation as is', () => {
    const string = '¡Welcome to Exodus.'
    const result = extractPunctuations(string)

    expect(result).toMatchObject({ message: '¡Welcome to Exodus', leading: '', trailing: '.' })
  })

  test('should match multiple ... leading punctuation', () => {
    const string = '... welcome to Exodus'
    const result = extractPunctuations(string)

    expect(result).toMatchObject({ message: 'welcome to Exodus', leading: '... ', trailing: '' })
  })

  test('should match … (ellipsis) leading punctuation', () => {
    const string = '…welcome to Exodus'
    const result = extractPunctuations(string)

    expect(result).toMatchObject({ message: 'welcome to Exodus', leading: '…', trailing: '' })
  })

  test('should match punctuation without something else', () => {
    const string = '...!Welcome to Exodus.'
    const result = extractPunctuations(string)

    expect(result).toMatchObject({ message: '!Welcome to Exodus', leading: '...', trailing: '.' })
  })

  test('should match punctuation and whitespace without something else', () => {
    const string = '... ¡Welcome to Exodus.'
    const result = extractPunctuations(string)

    expect(result).toMatchObject({ message: '¡Welcome to Exodus', leading: '... ', trailing: '.' })
  })
})
