import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayProfileSettingsThemeChange',
    properties: {
      ...commonProps,
      new_theme_name: 'Gold',
    },
  },
  {
    event: 'PayProfileSettingsThemeChange',
    properties: {
      ...commonProps,
      new_theme_name: 'Cash',
    },
  },
]

describe('PayProfileSettingsThemeChange', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayProfileSettingsThemeChange" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayProfileSettingsThemeChange" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayProfileSettingsThemeChange" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid new_theme_name value', () => {
    expect(() =>
      validate({
        event: 'PayProfileSettingsThemeChange',
        properties: {
          ...commonProps,
          new_theme_name: 'Silver',
        },
      })
    ).toThrow()
  })

  it('Should reject invalid new_theme_name type', () => {
    expect(() =>
      validate({
        event: 'PayProfileSettingsThemeChange',
        properties: {
          ...commonProps,
          new_theme_name: 123,
        },
      })
    ).toThrow()
  })
})
