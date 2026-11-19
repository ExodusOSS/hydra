import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletAssetFreeze',
    properties: {
      ...commonProps,
      for_what: 'energy',
      amount: 0,
      success: true,
    },
  },
]

describe('WalletAssetFreeze', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletAssetFreeze" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletAssetFreeze" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletAssetFreeze" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletAssetFreeze" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, success: 'cow' },
        })
      ).toThrow()
    })
  })
})
