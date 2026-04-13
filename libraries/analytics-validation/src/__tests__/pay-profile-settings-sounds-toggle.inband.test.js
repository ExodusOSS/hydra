import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayProfileSettingsSoundsToggle',
    properties: {
      ...commonProps,
      toggle_on: true,
    },
  },
  {
    event: 'PayProfileSettingsSoundsToggle',
    properties: {
      ...commonProps,
      toggle_on: false,
    },
  },
]

describe('PayProfileSettingsSoundsToggle', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayProfileSettingsSoundsToggle" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayProfileSettingsSoundsToggle" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayProfileSettingsSoundsToggle" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid toggle_on type', () => {
    expect(() =>
      validate({
        event: 'PayProfileSettingsSoundsToggle',
        properties: {
          ...commonProps,
          toggle_on: 'yes',
        },
      })
    ).toThrow()
  })
})
