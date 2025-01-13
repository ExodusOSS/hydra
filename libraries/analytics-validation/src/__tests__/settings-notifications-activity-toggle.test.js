import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'SettingsNotificationsActivityToggle',
    properties: {
      ...commonProps,
      toggled_on: true,
    },
  },
]

describe('SettingsNotificationsActivityToggle', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "SettingsNotificationsActivityToggle" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "SettingsNotificationsActivityToggle" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "SettingsNotificationsActivityToggle" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "SettingsNotificationsActivityToggle" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, toggled_on: 'yes' },
        })
      ).toThrow()
    })
  })
})
