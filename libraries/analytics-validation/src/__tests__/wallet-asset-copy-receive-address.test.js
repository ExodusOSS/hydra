import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletAssetCopyReceiveAddress',
    properties: {
      ...commonProps,
      asset_name: 'bitcoin',
      network: 'main',
    },
  },
]

describe('WalletAssetCopyReceiveAddress', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletAssetCopyReceiveAddress" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletAssetCopyReceiveAddress" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletAssetCopyReceiveAddress" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletAssetCopyReceiveAddress" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, asset_name: true },
        })
      ).toThrow()
    })
  })
})
