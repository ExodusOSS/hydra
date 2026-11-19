import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayRewardsBannerView',
    properties: {
      ...commonProps,
      stablecoin_balance_usd: 1250.5,
      stablecoin_balance_usdc_solana: 1000.5,
      stablecoin_balance_usdt_solana: 0,
      stablecoin_balance_usdc_ethereum: 0,
      stablecoin_balance_usdt_ethereum: 250,
      stablecoin_balance_usdc_bsc: 0,
      stablecoin_balance_usdt_bsc: 0,
      stablecoin_balance_usdc_ethereumarbone: 0,
      stablecoin_balance_usdt_ethereumarbone: 0,
      stablecoin_balance_usdc_matic: 0,
      stablecoin_balance_usdt_matic: 0,
      stablecoin_balance_usdc_basemainnet: 0,
      stablecoin_balance_usdt_tronmainnet: 0,
      stablecoin_balance_usdc_optimism: 0,
      stablecoin_balance_usdt_optimism: 0,
      stablecoin_balance_usdc_avalanchec: 0,
      stablecoin_balance_usdt_avalanchec: 0,
      stablecoin_assets: ['usdcoin_solana', 'tetherusd_solana'],

      surface: 'wallet_carousel',
      invitation: 'new',
    },
  },
  {
    event: 'PayRewardsBannerView',
    properties: {
      ...commonProps,
      surface: 'pay_home',
      invitation: 'existing',
    },
  },
  {
    event: 'PayRewardsBannerView',
    properties: {
      ...commonProps,
      stablecoin_balance_usd: 1250.5,
      stablecoin_assets: ['usdcoin_solana', 'tetherusd_solana'],

      surface: 'profile',
      invitation: 'new',
    },
  },
  {
    event: 'PayRewardsBannerView',
    properties: {
      ...commonProps,
      stablecoin_balance_usd: 825,
      stablecoin_balance_usdc_solana: 25,
      stablecoin_balance_dai_ethereum: 800,
      stablecoin_balance_pyusd_ethereum: 0,
      stablecoin_balance_pyusd_solana: 0,
      stablecoin_balance_dai_matic: 0,
      stablecoin_balance_tusd_ethereum: 0,
      stablecoin_balance_busd_ethereum: 0,
      stablecoin_balance_usdc_algorand: 0,
      stablecoin_balance_busd_bsc: 0,
      stablecoin_balance_dai_bsc: 0,
      stablecoin_balance_gusd_ethereum: 0,
      stablecoin_balance_usdt_algorand: 0,
      stablecoin_balance_rlusd_ripple: 0,
      stablecoin_assets: ['usdcoin_solana', 'mcd'],

      surface: 'pay_home',
      invitation: 'new',
    },
  },
]

describe('PayRewardsBannerView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayRewardsBannerView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayRewardsBannerView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayRewardsBannerView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid surface value', () => {
    expect(() =>
      validate({
        event: 'PayRewardsBannerView',
        properties: { ...commonProps, surface: 'settings', invitation: 'new' },
      })
    ).toThrow()
  })

  it('Should reject a negative extra stablecoin balance', () => {
    expect(() =>
      validate({
        event: 'PayRewardsBannerView',
        properties: { ...fixtures[3]!.properties, stablecoin_balance_dai_ethereum: -1 },
      })
    ).toThrow()
  })

  it('Should reject invalid invitation value', () => {
    expect(() =>
      validate({
        event: 'PayRewardsBannerView',
        properties: { ...commonProps, surface: 'pay_home', invitation: true },
      })
    ).toThrow()
  })

  it('Should reject a negative balance on a network', () => {
    expect(() =>
      validate({
        event: 'PayRewardsBannerView',
        properties: { ...fixtures[0]!.properties, stablecoin_balance_usdt_bsc: -1 },
      })
    ).toThrow()
  })
})
