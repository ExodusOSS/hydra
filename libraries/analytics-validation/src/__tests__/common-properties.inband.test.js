import { readFileSync } from 'fs'
import { join } from 'path'

import buildSchema from './_build-schema.js'

const schema = JSON.parse(
  readFileSync(join(import.meta.dirname, '../common-properties.schemasafe.json'), 'utf8') // bundleable when single-line
)

const validateCommonProperties = buildSchema(schema)

const fixtures = {
  time: [1_680_778_312],
  navigation_time: [1_680_778_312],
  distinct_id: ['7e3kHRdNtUShoEyyoNDb65NK2q0hYImaNodduN0Oe10='],
  app_build: ['prod'],
  app_platform: ['mobile'],
  app_version: ['23.3.28', '25.24.16-automation', '25.24.16-ci.2d3ac31', '25.24.16000'],
  account_compatibility_mode: ['exodus', 'ledger', 'trezor', 'phantom'],
  account_source: ['exodus'],
  asset_exchanged_last_90: [false],
  asset_purchased_last_90: [false],
  asset_sold_last_90: [false],
  asset_received_last_90: [true],
  asset_sent_last_90: [true],
  asset_staked_last_90: [false],
  is_staking: [true],
  staked_assets: [['solana', 'cardano']],
  device_manufacturer: ['Apple'],
  device_model: ['arm64'], // both model and arch exist in mixpanel
  device_arch: ['arm64'],
  experiments: [
    [
      'lightning-app:enabled',
      'nft-app:enabled',
      'ftx-21.7.29:A',
      'exchange-2022-06-20:default',
      'exchange-metrics:enabled',
      'ramp-onboarding:enabled',
      'ramp-app:on',
      'ramp-tab-button:off',
      'on-ramp-experiment-1:v1',
      'wallet-connect:enabled',
      'wallet-connect-dapps:enabled',
      'seedless:disabled',
      'wallet-connect-dapps:enabled',
      'wallet-connect:enabled',
      'exchange-v2-21.8.12:v1',
      'exchange-v3:enabled',
      'exchange-v3:disabled',
    ],
  ],
  has_balance: [false],
  has_nft: [false],
  locale: [
    ['en-US'],
    ['en-US', 'en'],
    ['zh-Hans-CN', 'es-419', 'de-CH-1901', 'sr-Cyrl-RS'],
    'unknown_unknown',
    'unknown-unknown',
  ], // submitted to the API as an array of strings
  mp_lib: ['Segment: unknown'],
  mp_processing_time_ms: [1_680_778_317_249],
  os_name: ['ios', 'mac', 'linux', 'win', 'cros'],
  os_version: ['16.3.1', '16.0', '16', '15.123.123', 'x86_64'],
  screen_height: [800],
  screen_width: [400],
  selected_language: ['en', 'es'],
  has_backup: [true, false],
  region: ['NY', 'L', '03'],
  country: ['US', 'NL', 'UK'],
  on_vpn: [true],
  wallet_age: [5, 0],
  device_tz_matches_ip: [false],
  on_phone_call: [true],
  restricted_device: [false],
  restricted_os: [false],
  number_of_assets: [0],
  number_of_assets_enabled: [0],
  trust_score: [1.5, 4],
  adjusted_trust_score: [0, 2.3],
  risk_metrics_loading: [true, false],
  total_balance: [0, 100],
  btc_balance: [0, 100],
  btc_balance_usd: [0, 100],
  sol_balance: [0, 100],
  sol_balance_usd: [0, 100],
  eth_balance: [0, 100],
  eth_balance_usd: [0, 100],
  trx_balance: [0, 100],
  trx_balance_usd: [0, 100],
  usdt_balance: [0, 100],
  usdt_balance_usd: [0, 100],
  usdttrx_balance: [0, 100],
  usdttrx_balance_usd: [0, 100],
  lightning_btc_balance: [0, 100],
  lightning_btc_balance_usd: [0, 100],
  xmr_balance: [0, 100],
  xmr_balance_usd: [0, 100],
}

describe('commonProperties', () => {
  Object.entries(fixtures).forEach(([eventName, eventValues]) => {
    it(`validates ${eventName} property`, () => {
      // ['time', [1,2,3] ] --> { time: 1 }, { time: 2 }, { time: 3 }.
      const possibleEvents = eventValues.map((eventValue) => ({ [eventName]: eventValue }))
      possibleEvents.forEach((event) => expect(validateCommonProperties(event)).toEqual(event))
    })
  })
})
