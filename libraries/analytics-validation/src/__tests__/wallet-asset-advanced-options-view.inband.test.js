import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletAssetAdvancedOptionsView',
    properties: {
      ...commonProps,
      asset_name: 'bitcoin',
      network: 'bitcoin',
      available_balance: 0,
      frozen_balance: 0,
      available_energy: 0,
      available_bandwidth: 0,
      frozen_for_energy: 0,
      frozen_for_bandwidth: 0,
    },
  },
]

describe('WalletAssetAdvancedOptionsView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletAssetAdvancedOptionsView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletAssetAdvancedOptionsView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletAssetAdvancedOptionsView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletAssetAdvancedOptionsView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, network: 3 },
        })
      ).toThrow()
    })
  })
})
