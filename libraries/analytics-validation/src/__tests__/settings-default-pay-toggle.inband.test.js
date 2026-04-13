import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'SettingsDefaultPayToggle',
    properties: {
      ...commonProps,
      toggled_on: true,
    },
  },
]

describe('SettingsDefaultPayToggle', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "SettingsDefaultPayToggle" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "SettingsDefaultPayToggle" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "SettingsDefaultPayToggle" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "SettingsDefaultPayToggle" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, toggled_on: 'yes' },
        })
      ).toThrow()
    })
  })
})
