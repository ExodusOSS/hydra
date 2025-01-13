import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletAssetMigrate',
    properties: {
      ...commonProps,
      asset_name: 'bnbmainnet',
      network: 'bnbmainnet',
      amount: 123,
      amount_usd: 123,
      success: true,
    },
  },
]

describe('WalletAssetMigrate', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletAssetMigrate" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletAssetMigrate" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletAssetMigrate" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletAssetMigrate" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, asset_name: ['nano'] },
        })
      ).toThrow()
    })
  })
})
