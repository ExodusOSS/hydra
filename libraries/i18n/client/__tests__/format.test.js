import { getTranslationTokens } from '../format.js'

describe('getTranslationTokens', () => {
  it('should split by jsx tags', () => {
    const actual = getTranslationTokens(
      '<p>This is a element with a <a>nested element on it</a></p> and this is not'
    )

    const expected = [
      '<p>',
      'This is a element with a ',
      '<a>',
      'nested element on it',
      '</a>',
      '</p>',
      ' and this is not',
    ]

    expect(actual).toEqual(expected)
  })

  it('should split by jsx tags but not by < > signs', () => {
    const actual = getTranslationTokens(
      'This is a string with this char > just as a symbol and a <p>here!</p>'
    )

    const expected = [
      'This is a string with this char > just as a symbol and a ',
      '<p>',
      'here!',
      '</p>',
    ]

    expect(actual).toEqual(expected)
  })

  it('should not split strings with \\n character ', () => {
    const actual = getTranslationTokens("The only Web3 wallet\nyou'll ever need")

    expect(actual).toEqual(["The only Web3 wallet\nyou'll ever need"])
  })
})
