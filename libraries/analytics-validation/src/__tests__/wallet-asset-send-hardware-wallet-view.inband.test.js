import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletAssetSendHardwareWalletView',
    properties: {
      ...commonProps,
      asset_name: 'bitcoin',
      network: 'bitcoin',
      amount: '1324',
      amount_usd: '4654987784',
    },
  },
]

describe('WalletAssetSendHardwareWalletView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletAssetSendHardwareWalletView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletAssetSendHardwareWalletView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletAssetSendHardwareWalletView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletAssetSendHardwareWalletView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, asset_name: 1, network: 2 },
        })
      ).toThrow()
    })
  })
})
