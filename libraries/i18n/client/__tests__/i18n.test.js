import I18n from '../i18n.js'

const en = {
  'Out of the way, Potter!': [{ type: 'text', value: 'Out of the way, Potter!' }],
  'Out of the way, {name}!': [
    { type: 'text', value: 'Out of the way, ' },
    { type: 'arg', name: 'name', position: 0 },
    { type: 'text', value: '!' },
  ],
}

describe('I18n', () => {
  let i18n

  beforeEach(() => {
    i18n = new I18n({
      defaultCurrency: 'USD',
      defaultLanguage: 'en',
      languages: { en },
    })
  })

  it('should use id if it is unknown', () => {
    const id = 'This is an unknown message'
    expect(i18n.getTranslation(id)).toEqual([{ type: 'text', value: id }])
  })

  it('should use translation when present', () => {
    const id = 'Out of the way, Potter!'
    const tokens = [{ type: 'text', value: 'Aus dem Weg, Potter!' }]

    i18n.load({
      en,
      de: {
        [id]: tokens,
      },
    })
    i18n.setLanguage('de')

    expect(i18n.getTranslation(id)).toEqual(tokens)
  })

  it('should use default if translation is empty', () => {
    const id = 'Out of the way, Potter!'
    i18n.load({
      en,
      de: {
        [id]: [],
      },
    })
    i18n.setLanguage('de')

    expect(i18n.getTranslation(id)).toEqual(en[id])
  })

  describe('formatters', () => {
    it('should expose currency() as a formatter method that uses the default currency', () => {
      expect(typeof i18n.currency).toBe('function')
      expect(i18n.currency(12.5)).toBe('$12.50')
    })

    it('should reflect setCurrency() updates in subsequent currency() calls', () => {
      i18n.setCurrency('EUR')
      expect(typeof i18n.currency).toBe('function')
      expect(i18n.currency(12.5)).toBe('€12.50')
    })

    it('should emit a change event with the new currency on setCurrency()', () => {
      const handler = jest.fn()
      i18n.addListener('change', handler)
      i18n.setCurrency('EUR')
      expect(handler).toHaveBeenCalledWith({ currency: 'EUR' })
    })

    it('should interpolate currency-typed args using the current currency', () => {
      i18n.setCurrency('EUR')
      expect(
        i18n.translate('You owe {amount, number, currency}', {
          values: { amount: { value: 5 } },
        })
      ).toBe('You owe €5.00')
    })

    it('should expose number() and amount() formatter methods', () => {
      expect(i18n.number(1234.5)).toBe('1,234.5')
      expect(i18n.amount('1234.5 BTC')).toBe('1,234.5 BTC')
    })
  })

  describe('trailing punctuations', () => {
    const translateIn = (language, id, translation, trailing) => {
      i18n.load({ en, [language]: { [id]: [{ type: 'text', value: translation }] } })
      i18n.setLanguage(language)
      return i18n.translate(id, { punctuations: { trailing } })
    }

    it('should not repeat a trailing period the translation already has', () => {
      expect(translateIn('de', 'Vol', 'Vol.', '.')).toBe('Vol.')
    })

    it('should not repeat a trailing ellipsis the translation already has', () => {
      expect(translateIn('fr', 'Syncing', 'Synchronisation…', '…')).toBe('Synchronisation…')
    })

    it('should not add a period after an exclamation mark the translation has', () => {
      expect(translateIn('ru', 'Your funds are safe', 'Ваши средства в безопасности!', '.')).toBe(
        'Ваши средства в безопасности!'
      )
    })

    it('should not add a period after a CJK full stop the translation has', () => {
      expect(translateIn('zh', 'Your funds are safe', '您的资金是安全的。', '.')).toBe(
        '您的资金是安全的。'
      )
    })

    it('should append the trailing period when the translation has none', () => {
      expect(translateIn('ru', 'Unstaking takes', 'Анстейкинг займет', '.')).toBe(
        'Анстейкинг займет.'
      )
    })

    it('should append the trailing period to the untranslated id', () => {
      expect(i18n.translate('Back up now', { punctuations: { trailing: '.' } })).toBe(
        'Back up now.'
      )
    })
  })

  it('should use result with the actual variable resolve if multiple entries match computed id', () => {
    const originalEntryId = 'Out of the way, {name}!'
    const aliasEntryId = 'Out of the way, {displayName}!'
    const tokens = {
      [originalEntryId]: [
        { type: 'text', value: 'Out of the way, ' },
        { type: 'arg', name: 'name', position: 0 },
        { type: 'text', value: '!' },
      ],
      [aliasEntryId]: [
        { type: 'text', value: 'Out of the way, ' },
        { type: 'arg', name: 'displayName', position: 0 },
        { type: 'text', value: '!' },
      ],
    }

    i18n.load({
      en: tokens,
    })

    expect(i18n.getTranslation(aliasEntryId)).toEqual(tokens[aliasEntryId])
  })
})
