import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayProfileSettingsNotificationsToggle',
    properties: {
      ...commonProps,
      toggle_on: true,
    },
  },
  {
    event: 'PayProfileSettingsNotificationsToggle',
    properties: {
      ...commonProps,
      toggle_on: false,
    },
  },
]

describe('PayProfileSettingsNotificationsToggle', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayProfileSettingsNotificationsToggle" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayProfileSettingsNotificationsToggle" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayProfileSettingsNotificationsToggle" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid toggle_on type', () => {
    expect(() =>
      validate({
        event: 'PayProfileSettingsNotificationsToggle',
        properties: {
          ...commonProps,
          toggle_on: 'yes',
        },
      })
    ).toThrow()
  })
})
