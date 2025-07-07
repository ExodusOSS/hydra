import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'DAppSignMessageRequest',
    properties: {
      ...commonProps,
      approved: false,
      dapp_domain: 'kct9ji.csb.app',
    },
  },
  {
    event: 'DAppSignMessageRequest',
    properties: {
      app_build: 'prod',
      app_platform: 'mobile',
      app_version: '23.4.11',
      approved: true,
      account_source: 'exodus',
      asset_exchanged_last_90: false,
      asset_purchased_last_90: false,
      asset_sold_last_90: false,
      asset_received_last_90: false,
      asset_sent_last_90: false,
      asset_staked_last_90: false,
      connection_protocol: 'WalletConnect',
      dapp_domain: 'xen.network',
      device_manufacturer: 'Apple',
      experiments: [
        'nft-app:enabled',
        'exchange-metrics:enabled',
        'ramp-onboarding:enabled',
        'ftx-21.7.29:A',
        'lightning-app:enabled',
        'ramp-tab-button:off',
        'ramp-app:on',
        'wallet-connect:enabled',
        'wallet-connect-dapps:enabled',
        'on-ramp-experiment-1:v1',
        'exchange-2022-06-20:default',
        'seedless:disabled',
      ],
      has_balance: true,
      has_nft: false,
      locale: 'en-US',
      mp_lib: 'Segment: unknown',
      app_id: 'exodus',
      os_name: 'ios',
      os_version: '16.0.3',
      screen_height: 800,
      screen_width: 400,
    },
  },
]

describe('DAppSignMessageRequest', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "DAppSignMessageRequest" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "DAppSignMessageRequest" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "DAppSignMessageRequest" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
