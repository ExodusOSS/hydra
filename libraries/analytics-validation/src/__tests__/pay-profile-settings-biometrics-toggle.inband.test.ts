import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayProfileSettingsBiometricsToggle',
    properties: {
      ...commonProps,
      toggle_on: true,
    },
  },
  {
    event: 'PayProfileSettingsBiometricsToggle',
    properties: {
      ...commonProps,
      toggle_on: false,
    },
  },
]

describe('PayProfileSettingsBiometricsToggle', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayProfileSettingsBiometricsToggle" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayProfileSettingsBiometricsToggle" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayProfileSettingsBiometricsToggle" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid toggle_on type', () => {
    expect(() =>
      validate({
        event: 'PayProfileSettingsBiometricsToggle',
        properties: {
          ...commonProps,
          toggle_on: 'yes',
        },
      })
    ).toThrow()
  })
})
