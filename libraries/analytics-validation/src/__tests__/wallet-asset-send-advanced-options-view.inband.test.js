import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletAssetSendAdvancedOptionsView',
    properties: {
      ...commonProps,
      asset_name: 'ethereum',
      network: 'ethereum',
    },
  },
]

describe('WalletAssetSendAdvancedOptionsView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletAssetSendAdvancedOptionsView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletAssetSendAdvancedOptionsView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletAssetSendAdvancedOptionsView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletAssetSendAdvancedOptionsView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, asset_name: 3 },
        })
      ).toThrow()
    })
  })
})
