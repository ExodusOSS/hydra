import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'XopayTransactionConfirm',
    properties: {
      ...commonProps,
      from_asset: 'BTC',
      from_asset_network: 'BTC',
      from_asset_amount: 0.0001,
      from_asset_amount_usd: 1,
      to_asset: 'USDT',
      to_asset_network: 'USDT',
      to_asset_amount: 1,
      to_asset_amount_usd: 1,
      success: true,
    },
  },
]

describe('XopayTransactionConfirm', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "XopayTransactionConfirm" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "XopayTransactionConfirm" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "XopayTransactionConfirm" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "XopayTransactionConfirm" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, from_asset: 3 },
        })
      ).toThrow()
    })
  })
})
