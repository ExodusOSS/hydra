import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletAssetBitcoinLegacyAddressToggle',
    properties: {
      ...commonProps,
      toggled_on: true,
    },
  },
  {
    event: 'WalletAssetBitcoinLegacyAddressToggle',
    properties: {
      ...commonProps,
      toggled_on: false,
    },
  },
]

describe('WalletAssetBitcoinLegacyAddressToggle', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletAssetBitcoinLegacyAddressToggle" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletAssetBitcoinLegacyAddressToggle" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletAssetBitcoinLegacyAddressToggle" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletAssetBitcoinLegacyAddressToggle" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: [],
        })
      ).toThrow()
    })
  })
})
