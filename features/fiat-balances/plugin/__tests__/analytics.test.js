import { UnitType } from '@exodus/currency'
import assert from 'minimalistic-assert'

import pluginDefinition from '../analytics.js'

const assets = {
  bitcoin: {
    name: 'bitcoin',
    ticker: 'BTC',
    currency: UnitType.create({
      satoshi: 0,
      BTC: 8,
    }),
  },
  ethereum: {
    name: 'ethereum',
    ticker: 'ETH',
    currency: UnitType.create({
      wei: 0,
      ETH: 18,
    }),
  },
}

const createMockAnalytics = () => {
  let properties = {}
  return {
    setDefaultEventProperties: (props) => {
      properties = { ...properties, ...props }
    },
    getProperties: () => properties,
    reset: () => {
      properties = {}
    },
  }
}

const createMockFiatRateConverter = () => {
  const cryptoPricesUSD = {
    BTC: 100_000,
    ETH: 3000,
  }

  return {
    toFiatCurrency: async ({ amount, currency }) => {
      if (currency !== 'USD') {
        throw new Error(`Mock only supports USD conversion, got ${currency}`)
      }

      const ticker = amount.unitName
      const priceUSD = cryptoPricesUSD[ticker]

      if (!priceUSD) {
        throw new Error(`No USD price for ${ticker}`)
      }

      const usdValue = amount.toDefaultNumber() * priceUSD

      return {
        toDefaultNumber: () => usdValue,
      }
    },
  }
}

// Utility to wait for analytics properties to be set
const waitForAnalyticsProperties = () => new Promise((resolve) => setTimeout(resolve, 16))

describe('fiatBalancesAnalyticsPlugin', () => {
  // This utility makes sure 'this' is bound correctly to the map methods of the atom value, instead of the wrapping Proxy
  const createMockAssetsTotalWalletAmountsAtom = () => {
    let currentValue
    const observers = []

    return {
      set: (value) => {
        currentValue = value
        observers.forEach((observer) => observer(value))
      },
      observe: (observer) => {
        observers.push(observer)
        observer(currentValue)
        return () => {
          const index = observers.indexOf(observer)
          if (index > -1) observers.splice(index, 1)
        }
      },
    }
  }

  const prepare = ({ config = {} } = {}) => {
    const assetsTotalWalletAmountsAtom = createMockAssetsTotalWalletAmountsAtom()
    const fiatRateConverter = createMockFiatRateConverter()
    const analytics = createMockAnalytics()

    const plugin = pluginDefinition.factory({
      analytics,
      assetsTotalWalletAmountsAtom,
      fiatRateConverter,
      config: {
        assetsToTrackForBalances: [
          { assetName: 'bitcoin', analyticsName: 'btc_balance_usd' },
          { assetName: 'ethereum', analyticsName: 'eth_balance_usd' },
        ],
        ...config,
      },
    })

    plugin.onStart()

    return { plugin, assetsTotalWalletAmountsAtom, analytics }
  }

  it('should convert crypto balances to USD correctly', async () => {
    const { assetsTotalWalletAmountsAtom, analytics } = prepare()

    assetsTotalWalletAmountsAtom.set(
      new Map([
        ['bitcoin', assets.bitcoin.currency.BTC(0.002)], // $200
        ['ethereum', assets.ethereum.currency.ETH(0.01)], // $30
      ])
    )

    await waitForAnalyticsProperties()
    const properties = analytics.getProperties()

    assert(
      properties.btc_balance_usd === 200,
      `BTC balance should be 200 USD, got ${properties.btc_balance_usd}`
    )
    assert(
      properties.eth_balance_usd === 30,
      `ETH balance should be 30 USD, got ${properties.eth_balance_usd}`
    )
    assert(
      properties.totalBalanceUsd === 230,
      `Total balance should be 230 USD, got ${properties.totalBalanceUsd}`
    )
  })

  it('should handle aggregated balances from multiple wallet accounts', async () => {
    const { assetsTotalWalletAmountsAtom, analytics } = prepare()

    assetsTotalWalletAmountsAtom.set(
      new Map([
        ['bitcoin', assets.bitcoin.currency.BTC(0.003)], // $300
        ['ethereum', assets.ethereum.currency.ETH(0.01)], // $30
      ])
    )

    await waitForAnalyticsProperties()
    const properties = analytics.getProperties()

    assert(
      properties.btc_balance_usd === 300,
      `BTC balance should be 300 USD, got ${properties.btc_balance_usd}`
    )
    assert(
      properties.totalBalanceUsd === 330,
      `Total balance should be 330 USD, got ${properties.totalBalanceUsd}`
    )
  })

  it('should handle missing balances gracefully', async () => {
    const { assetsTotalWalletAmountsAtom, analytics } = prepare()

    assetsTotalWalletAmountsAtom.set(new Map([['bitcoin', assets.bitcoin.currency.BTC(0.002)]]))

    await waitForAnalyticsProperties()
    const properties = analytics.getProperties()

    assert(properties.btc_balance_usd === 200, 'BTC balance should be 200 USD')
    assert(properties.eth_balance_usd === 0, 'ETH balance should default to 0')
    assert(properties.totalBalanceUsd === 200, 'Total balance should be 200 USD')
  })

  it('should handle undefined balances', async () => {
    const { assetsTotalWalletAmountsAtom, analytics } = prepare()

    assetsTotalWalletAmountsAtom.set(undefined)

    await waitForAnalyticsProperties()
    const properties = analytics.getProperties()

    assert(
      Object.keys(properties).length === 0,
      'No properties should be set when balances is undefined'
    )
  })

  it('should handle zero balance correctly', async () => {
    const { assetsTotalWalletAmountsAtom, analytics } = prepare()

    assetsTotalWalletAmountsAtom.set(new Map())

    await waitForAnalyticsProperties()
    const properties = analytics.getProperties()

    assert(properties.btc_balance_usd === 0, 'BTC balance should be 0')
    assert(properties.totalBalanceUsd === 0, 'Total balance should be 0')
  })

  it('should cleanup subscriptions on stop', async () => {
    const { plugin, assetsTotalWalletAmountsAtom, analytics } = prepare()

    plugin.onStop()

    // After stopping, updates should not trigger analytics updates
    analytics.reset()
    assetsTotalWalletAmountsAtom.set(new Map([['bitcoin', assets.bitcoin.currency.BTC(0.002)]]))

    await waitForAnalyticsProperties()

    const properties = analytics.getProperties()
    assert(
      Object.keys(properties).length === 0,
      'No properties should be set after plugin is stopped'
    )
  })
})
