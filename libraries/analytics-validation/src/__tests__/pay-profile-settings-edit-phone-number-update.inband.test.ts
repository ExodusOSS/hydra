import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayProfileSettingsEditPhoneNumberUpdate',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayProfileSettingsEditPhoneNumberUpdate', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayProfileSettingsEditPhoneNumberUpdate" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayProfileSettingsEditPhoneNumberUpdate" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayProfileSettingsEditPhoneNumberUpdate" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
