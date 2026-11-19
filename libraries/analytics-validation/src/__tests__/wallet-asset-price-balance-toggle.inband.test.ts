import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletAssetPriceBalanceToggle',
    properties: {
      ...commonProps,
      asset_name: 'bitcoin',
      network: 'bitcoin',
      price_or_balance: 'price',
    },
  },
]

describe('WalletAssetPriceBalanceToggle', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletAssetPriceBalanceToggle" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletAssetPriceBalanceToggle" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletAssetPriceBalanceToggle" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletAssetPriceBalanceToggle" property of invalid format', () => {
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
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, price_or_balance: 'prices' },
        })
      ).toThrow()
    })
  })
})
