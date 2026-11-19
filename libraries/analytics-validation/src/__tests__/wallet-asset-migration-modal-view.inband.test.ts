import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletAssetMigrationModalView',
    properties: {
      ...commonProps,
      asset_name: 'bnbmainnet',
      network: 'bnbmainnet',
    },
  },
]

describe('WalletAssetMigrationModalView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletAssetMigrationModalView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletAssetMigrationModalView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletAssetMigrationModalView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletAssetMigrationModalView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, asset_name: ['nano'] },
        })
      ).toThrow()
    })
  })
})
