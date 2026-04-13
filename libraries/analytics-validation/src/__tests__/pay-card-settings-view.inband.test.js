import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCardSettingsView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayCardSettingsView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayCardSettingsView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayCardSettingsView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayCardSettingsView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
