import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayRewardsJoin',
    properties: {
      ...commonProps,
      eligible_assets: ['usdcoin_solana'],
      wallet_age_days: 31,

      entry_point: 'wallet_banner',
      intro_variant: 'new_user',
      eligible_asset_count: 2,
      eligible_balance_usd: 1250.5,
      eligible_balance_usdc_solana: 1000.5,
      eligible_balance_usdt_solana: 0,
      eligible_balance_usdc_ethereum: 0,
      eligible_balance_usdt_ethereum: 250,
      eligible_balance_usdc_bsc: 0,
      eligible_balance_usdt_bsc: 0,
      eligible_balance_usdc_ethereumarbone: 0,
      eligible_balance_usdt_ethereumarbone: 0,
      eligible_balance_usdc_matic: 0,
      eligible_balance_usdt_matic: 0,
      eligible_balance_usdc_basemainnet: 0,
      eligible_balance_usdt_tronmainnet: 0,
      eligible_balance_usdc_optimism: 0,
      eligible_balance_usdt_optimism: 0,
      eligible_balance_usdc_avalanchec: 0,
      eligible_balance_usdt_avalanchec: 0,
      network_fee_usd: 0.02,
      fee_reimbursement_points: 20,
    },
  },
  {
    event: 'PayRewardsJoin',
    properties: {
      ...commonProps,
      entry_point: 'settings',
      intro_variant: 'existing_pay_user',
      eligible_asset_count: 0,
      eligible_balance_usd: 0,
      network_fee_usd: null,
      fee_reimbursement_points: null,
    },
  },
  {
    event: 'PayRewardsJoin',
    properties: {
      ...commonProps,
      eligible_assets: ['usdcoin_solana'],
      wallet_age_days: 31,

      entry_point: 'profile',
      intro_variant: 'new_user',
      eligible_asset_count: 2,
      eligible_balance_usd: 1250.5,
      network_fee_usd: 0.02,
      fee_reimbursement_points: 20,
    },
  },
  {
    event: 'PayRewardsJoin',
    properties: {
      ...commonProps,
      entry_point: 'send_invitation',
      intro_variant: 'new_user',
      eligible_asset_count: 1,
      eligible_balance_usd: 25,
      network_fee_usd: 0.02,
      fee_reimbursement_points: 20,
    },
  },
  {
    event: 'PayRewardsJoin',
    properties: {
      ...commonProps,
      eligible_assets: ['usdcoin_solana', 'mcd'],

      entry_point: 'pay_home_card',
      intro_variant: 'new_user',
      eligible_asset_count: 2,
      eligible_balance_usd: 825,
      eligible_balance_usdc_solana: 25,
      eligible_balance_dai_ethereum: 800,
      eligible_balance_pyusd_ethereum: 0,
      eligible_balance_pyusd_solana: 0,
      eligible_balance_dai_matic: 0,
      eligible_balance_tusd_ethereum: 0,
      eligible_balance_busd_ethereum: 0,
      eligible_balance_usdc_algorand: 0,
      eligible_balance_busd_bsc: 0,
      eligible_balance_dai_bsc: 0,
      eligible_balance_gusd_ethereum: 0,
      eligible_balance_usdt_algorand: 0,
      eligible_balance_rlusd_ripple: 0,
      network_fee_usd: null,
      fee_reimbursement_points: null,
    },
  },
]

describe('PayRewardsJoin', () => {
  it.each(['swap_fee', 'onboarding', 'send_invitation'])(
    'accepts the Rewards v2 %s entry point',
    (entryPoint) => {
      const event = {
        ...fixtures[0]!,
        properties: { ...fixtures[0]!.properties, entry_point: entryPoint },
      }
      expect(validate(event)).toEqual(event)
    }
  )

  fixtures.forEach((event) => {
    it('The main schema validates "PayRewardsJoin" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayRewardsJoin" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayRewardsJoin" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  const validProperties = fixtures[0]!.properties

  it.each([
    ['entry_point', 'deep_link'],
    ['intro_variant', 'returning'],
    ['eligible_asset_count', '2'],
    ['eligible_balance_usd', null],
    ['eligible_balance_usdc_solana', '1000'],
    ['eligible_balance_usdt_bsc', -1],
    ['eligible_balance_dai_ethereum', -1],
    ['network_fee_usd', '0.02'],
    ['fee_reimbursement_points', 'twenty'],
  ])('Should reject invalid %s value', (property, value) => {
    expect(() =>
      validate({
        event: 'PayRewardsJoin',
        properties: { ...validProperties, [property]: value },
      })
    ).toThrow()
  })
})
