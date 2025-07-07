import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'SettingsChooseConnectionWalletToggle',
    properties: {
      ...commonProps,
      toggled_on: true,
    },
  },
  {
    event: 'SettingsChooseConnectionWalletToggle',
    properties: {
      ...commonProps,
      toggled_on: false,
    },
  },
]

describe('SettingsChooseConnectionWalletToggle', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "SettingsChooseConnectionWalletToggle" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "SettingsChooseConnectionWalletToggle" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "SettingsChooseConnectionWalletToggle" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "SettingsChooseConnectionWalletToggle" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: [],
        })
      ).toThrow()
    })
  })
})
