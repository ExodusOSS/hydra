import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletAssetSendNoGas',
    properties: {
      ...commonProps,
      is_zero_balance: true,
      coin_or_token: 'coin',
      asset_name: 'bitcoin',
      network: 'bitcoin',
    },
  },
]

describe('WalletAssetSendNoGas', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletAssetSendNoGas" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletAssetSendNoGas" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletAssetSendNoGas" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletAssetSendNoGas" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, is_zero_balance: 3 },
        })
      ).toThrow()
    })
  })
})
