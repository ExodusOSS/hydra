import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'DAppSignTransactionRequest',
    properties: {
      ...commonProps,
      approved: false,
      dapp_domain: 'app.compound.finance',
      connection_protocol: 'dApp Browser',
    },
  },
  {
    event: 'DAppSignTransactionRequest',
    properties: {
      app_platform: 'browser',
      app_version: '23.1.18',
      app_build: 'dev',
      app_id: 'exodus',
      os_name: 'darwin',
      device_model: 'arm64',
      locale: ['en-GB', 'en-US', 'en'],
      account_source: 'exodus',
      asset_exchanged_last_90: true,
      selected_language: 'en',
      asset_purchased_last_90: false,
      asset_sold_last_90: false,
      has_nft: true,
      asset_sent_last_90: true,
      asset_received_last_90: true,
      asset_staked_last_90: false,
      has_balance: true,
      approved: false,
      dapp_domain: 'q0vofx.csb.app',
    },
  },
]

describe('DappSignTransactionRequest', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "DAppSignTransactionRequest" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "DAppSignTransactionRequest" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "DAppSignTransactionRequest" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
