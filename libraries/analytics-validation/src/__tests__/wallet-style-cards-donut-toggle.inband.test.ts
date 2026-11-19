import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletStyleCardsDonutToggle',
    properties: {
      ...commonProps,
      mode_activated: 'cards',
    },
  },
]

describe('WalletStyleCardsDonutToggle', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletStyleCardsDonutToggle" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletStyleCardsDonutToggle" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletStyleCardsDonutToggle" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject invalid "mode_activated" value', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, mode_activated: 'invalid_value' },
        })
      ).toThrow()
    })

    it('Should reject "mode_activated" of invalid type', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, mode_activated: 123 },
        })
      ).toThrow()
    })

    it('Should validate all valid "mode_activated" enum values', () => {
      const validStyleModes = ['cards', 'donut']
      validStyleModes.forEach((mode) => {
        const validEvent = {
          event: 'WalletStyleCardsDonutToggle',
          properties: {
            ...commonProps,
            mode_activated: mode,
          },
        }
        expect(validate(validEvent)).toEqual(validEvent)
      })
    })
  })
})
