import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayProfileSettingsLogoutView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayProfileSettingsLogoutView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayProfileSettingsLogoutView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayProfileSettingsLogoutView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayProfileSettingsLogoutView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
