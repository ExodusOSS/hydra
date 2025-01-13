import { validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletAssetIrreversibleModalView',
    properties: {
      time: 1_682_084_347,
      app_build: 'prod',
      app_platform: 'mobile',
      app_version: '23.2.2',
      account_source: 'exodus',
      asset_exchanged_last_90: false,
      asset_purchased_last_90: false,
      asset_sold_last_90: false,
      asset_received_last_90: false,
      asset_sent_last_90: false,
      asset_staked_last_90: false,
      device_manufacturer: 'Apple',
      has_balance: false,
      has_nft: false,
      locale: 'en-US',
      mp_lib: 'Segment: unknown',
      app_id: 'exodus',
      os_name: 'ios',
      os_version: '16.3.1',
      screen_height: 800,
      screen_width: 400,
      amount: 10,
      amount_usd: 10.0104,
      asset_name: 'tetherusd_solana',
      network: 'solana',
    },
  },
]

describe('WalletAssetIrreversibleModalView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletAssetIrreversibleModalView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletAssetIrreversibleModalView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletAssetIrreversibleModalView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletAssetIrreversibleModalView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: {
            ...event.properties,
            amount_usd: 'string',
          },
        })
      ).toThrow()
    })
  })
})
