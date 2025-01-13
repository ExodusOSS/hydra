import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'ExchangeSwapUnavailableView',
    properties: {
      ...commonProps,
      user_asset_to: 'BTC',
      user_asset_to_network: 'bitcoin',
      user_asset_from: 'ETH',
      user_asset_from_network: 'ethereum',
    },
  },
]

describe('ExchangeSwapUnavailableView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "ExchangeSwapUnavailableView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "ExchangeSwapUnavailableView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "ExchangeSwapUnavailableView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "ExchangeSwapUnavailableView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, user_asset_to: false },
        })
      ).toThrow()
    })
  })
})
