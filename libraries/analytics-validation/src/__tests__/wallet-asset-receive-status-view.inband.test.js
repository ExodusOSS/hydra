import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletAssetReceiveStatusView',
    properties: {
      ...commonProps,
      asset_name: 'bitcoin',
      network: 'bitcoin',
    },
  },
]

describe('WalletAssetReceiveStatusView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletAssetReceiveStatusView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletAssetReceiveStatusView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletAssetReceiveStatusView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletAssetReceiveStatusView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, bitcoin: 3 },
        })
      ).toThrow()
    })
  })
})
