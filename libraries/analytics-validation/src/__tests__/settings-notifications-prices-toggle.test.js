import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'SettingsNotificationsPricesToggle',
    properties: {
      ...commonProps,
      toggled_on: true,
    },
  },
]

describe('SettingsNotificationsPricesToggle', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "SettingsNotificationsPricesToggle" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "SettingsNotificationsPricesToggle" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "SettingsNotificationsPricesToggle" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "SettingsNotificationsPricesToggle" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, toggled_on: 'yes' },
        })
      ).toThrow()
    })
  })
})
