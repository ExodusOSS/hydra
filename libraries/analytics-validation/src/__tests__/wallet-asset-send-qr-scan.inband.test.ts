import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletAssetSendQrScan',
    properties: {
      ...commonProps,
      success: true,
      includes_amounts: true,
    },
  },
]

describe('WalletAssetSendQrScan', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletAssetSendQrScan" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletAssetSendQrScan" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletAssetSendQrScan" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletAssetSendQrScan" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, success: 'true' },
        })
      ).toThrow()
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, includes_amounts: 1 },
        })
      ).toThrow()
    })

    it('Should accept "WalletAssetSendQrScan" with valid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, success: false, includes_amounts: false },
        })
      ).not.toThrow()
    })
  })
})
