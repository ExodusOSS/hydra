import { readFileSync } from 'fs'
import { join } from 'path'

import buildSchema from './_build-schema.js'

const schema = JSON.parse(
  readFileSync(join(import.meta.dirname, '../main.schemasafe.json'), 'utf8') // bundleable when single-line
)

export const validate = buildSchema(schema)
export const commonProps = {
  time: 1_682_084_347,
  app_build: 'prod',
  app_platform: 'mobile',
  app_version: '23.2.2',
  account_compatibility_mode: 'exodus',
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
  country: 'US',
  region: 'NY',
  has_backup: true,
}
