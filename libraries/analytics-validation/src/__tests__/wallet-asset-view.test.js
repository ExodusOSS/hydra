import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletAssetView',
    properties: {
      ...commonProps,
      asset_name: 'bitcoin',
      network: 'bitcoin',
      price_or_balance: 'price',
      spendable_balance: 1,
      asset_balance: 100,
      asset_balance_usd: 100,
    },
  },
]

describe('WalletAssetView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletAssetView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletAssetView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletAssetView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletAssetView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, asset_name: 3 },
        })
      ).toThrow()
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, network: 2 },
        })
      ).toThrow()
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, price_or_balance: 10 },
        })
      ).toThrow()
    })
  })
})
