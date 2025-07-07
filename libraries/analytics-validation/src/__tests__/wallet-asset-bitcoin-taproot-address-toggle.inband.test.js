import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletAssetBitcoinTaprootAddressToggle',
    properties: {
      ...commonProps,
      toggled_on: true,
    },
  },
  {
    event: 'WalletAssetBitcoinTaprootAddressToggle',
    properties: {
      ...commonProps,
      toggled_on: false,
    },
  },
]

describe('WalletAssetBitcoinTaprootAddressToggle', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletAssetBitcoinTaprootAddressToggle" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletAssetBitcoinTaprootAddressToggle" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletAssetBitcoinTaprootAddressToggle" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletAssetBitcoinTaprootAddressToggle" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: [],
        })
      ).toThrow()
    })
  })
})
