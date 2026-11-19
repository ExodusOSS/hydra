import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletAssetUnfreeze',
    properties: {
      ...commonProps,
      for_what: 'energy',
      amount: 0,
      success: true,
    },
  },
]

describe('WalletAssetUnfreeze', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletAssetUnfreeze" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletAssetUnfreeze" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletAssetUnfreeze" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletAssetUnfreeze" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, success: 3 },
        })
      ).toThrow()
    })
  })
})
