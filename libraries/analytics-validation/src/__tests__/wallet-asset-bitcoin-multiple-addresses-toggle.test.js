import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletAssetBitcoinMultipleAddressesToggle',
    properties: {
      ...commonProps,
      toggled_on: true,
    },
  },
  {
    event: 'WalletAssetBitcoinMultipleAddressesToggle',
    properties: {
      ...commonProps,
      toggled_on: false,
    },
  },
]

describe('WalletAssetBitcoinMultipleAddressesToggle', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletAssetBitcoinMultipleAddressesToggle" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletAssetBitcoinMultipleAddressesToggle" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletAssetBitcoinMultipleAddressesToggle" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletAssetBitcoinMultipleAddressesToggle" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: [],
        })
      ).toThrow()
    })
  })
})
