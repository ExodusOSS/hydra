import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletAssetSendAdvancedOptionsSave',
    properties: {
      ...commonProps,
      asset_name: 'bitcoin',
      network: 'bitcoin',
      acceleration_enabled: true,
      network_fee_rate: 16,
      network_fee_amount: 0.0001,
      network_fee_amount_usd: 1,
      slide_position: 'low',
    },
  },
]

describe('WalletAssetSendAdvancedOptionsSave', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletAssetSendAdvancedOptionsSave" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletAssetSendAdvancedOptionsSave" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletAssetSendAdvancedOptionsSave" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletAssetSendAdvancedOptionsSave" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, network_fee_rate: '16' },
        })
      ).toThrow()
    })
  })
})
