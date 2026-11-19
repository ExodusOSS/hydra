import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'ExchangeConfigureAssetSwapBounce',
    properties: {
      ...commonProps,
      /**
       * Fill in your properties here
       */
      user_asset_to: 'BTC',
      user_asset_to_network: 'bitcoin',
      user_amount_to: 0.123,
      user_amount_to_usd: 1000,
      user_asset_from: 'ETH',
      user_asset_from_network: 'ethereum',
      user_amount_from: 1.4,
      user_amount_from_usd: 1010,
      spread_percent: 10,
      spread_amount_usd: 10,
      max_network_fee: 6,
      has_more_than_min: true,
      has_more_than_max: false,
      all_or_max: 'all',
      amount_buttons_pressed: ['half', 'all'],
      user_balance_from: 1.6,
      user_balance_from_usd: 1100,
      user_balance_over_fees: true,
      number_of_swap_direction_changes: 0,
      default_pair: false,
    },
  },
]

describe('ExchangeConfigureAssetSwapBounce', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "ExchangeConfigureAssetSwapBounce" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "ExchangeConfigureAssetSwapBounce" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "ExchangeConfigureAssetSwapBounce" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "ExchangeConfigureAssetSwapBounce" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, default_pair: 'ETH_BTC' },
        })
      ).toThrow()
    })
  })
})
