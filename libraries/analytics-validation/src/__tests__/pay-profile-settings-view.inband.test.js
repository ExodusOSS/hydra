import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayProfileSettingsView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayProfileSettingsView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayProfileSettingsView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayProfileSettingsView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayProfileSettingsView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
