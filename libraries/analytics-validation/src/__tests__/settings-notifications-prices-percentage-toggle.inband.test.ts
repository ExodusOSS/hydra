import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'SettingsNotificationsPricesPercentageToggle',
    properties: {
      ...commonProps,
      percentage: '5',
    },
  },
]

describe('SettingsNotificationsPricesPercentageToggle', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "SettingsNotificationsPricesPercentageToggle" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "SettingsNotificationsPricesPercentageToggle" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "SettingsNotificationsPricesPercentageToggle" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "SettingsNotificationsPricesPercentageToggle" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, percentage: '99' },
        })
      ).toThrow()
    })
  })
})
