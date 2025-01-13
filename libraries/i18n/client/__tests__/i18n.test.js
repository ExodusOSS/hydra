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

  it('should use first result if multiple entries match computed id', () => {
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

    expect(i18n.getTranslation(aliasEntryId)).toEqual(tokens[originalEntryId])
  })
})
