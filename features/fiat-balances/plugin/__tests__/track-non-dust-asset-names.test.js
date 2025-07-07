import { createInMemoryAtom, waitUntil } from '@exodus/atoms'
import { UnitType } from '@exodus/currency'
import fiatCurrencies from '@exodus/fiat-currencies'
import lodash from 'lodash'
import assert from 'minimalistic-assert'

import { defaultNonDustAssetsConfig } from '../../shared/index.js'
import pluginDefinition from '../track-non-dust-asset-names.js'

const { isEqual } = lodash

const rates = {
  USD: 1,
  GBP: 2,
}

const fiatRateConverter = {
  toFiatCurrency: async ({ amount, currency }) => {
    assert(amount.unitName in rates, `No rate for ${amount.unitName}!`)
    return fiatCurrencies.USD.defaultUnit(amount.mul(rates[amount.unitName]).toDefaultNumber())
  },
}

const assets = {
  ethereum: {
    name: 'ethereum',
    ticker: 'ETH',
    get baseAsset() {
      return assets.ethereum
    },
    currency: UnitType.create({
      wei: 0,
      Kwei: 3,
      Mwei: 6,
      Gwei: 9,
      szabo: 12,
      finney: 15,
      ETH: 18,
    }),
  },
  solana: {
    name: 'solana',
    ticker: 'SOL',
    get baseAsset() {
      return assets.solana
    },
    currency: UnitType.create({
      Lamports: 0,
      SOL: 9,
    }),
  },
  solanaTwo: {
    name: 'solanaTwo',
    ticker: 'SOL2',
    get baseAsset() {
      return assets.solanaTwo
    },
    currency: UnitType.create({
      Lamports: 0,
      SOL: 9,
    }),
  },
}

const createAssetsModule = (assets) => ({
  getAsset: (assetName) => assets[assetName],
  getAssets: () => assets,
})

describe('trackNonDisableableAssetsPlugin', () => {
  const prepare = ({ config, ...opts } = {}) => {
    const fiatBalancesAtom = createInMemoryAtom()
    const assetsModule = opts.assets ? createAssetsModule(opts.assets) : createAssetsModule(assets)
    const nonDustBalanceAssetNamesAtom = createInMemoryAtom({
      defaultValue: [],
    })

    const plugin = pluginDefinition.factory({
      fiatBalancesAtom,
      fiatRateConverter,
      assetsModule,
      nonDustBalanceAssetNamesAtom,
      enabledAssetsAtom: createInMemoryAtom({ defaultValue: [] }),
      config: { ...defaultNonDustAssetsConfig, ...config },
      ...opts,
    })

    plugin.onLoad()
    return { plugin, fiatBalancesAtom, nonDustBalanceAssetNamesAtom }
  }

  it("doesn't track assets below a balance threshold", async () => {
    const { fiatBalancesAtom, nonDustBalanceAssetNamesAtom } = prepare()
    fiatBalancesAtom.set({
      balances: {
        byAssetSource: {
          exodus_0: {
            solana: { balance: fiatCurrencies.USD.defaultUnit(0.49) },
          },
        },
      },
    })

    await waitUntil({
      atom: nonDustBalanceAssetNamesAtom,
      predicate: (assetNames) => isEqual(assetNames, []),
    })
  })

  it('tracks assets above a balance threshold', async () => {
    const { fiatBalancesAtom, nonDustBalanceAssetNamesAtom } = prepare()
    fiatBalancesAtom.set({
      balances: {
        byAssetSource: {
          exodus_0: {
            solana: { balance: fiatCurrencies.USD.defaultUnit(0.51) },
          },
        },
      },
    })

    await waitUntil({
      atom: nonDustBalanceAssetNamesAtom,
      predicate: (assetNames) => isEqual([...assetNames].sort(), ['solana'].sort()),
    })
  })

  it('removes assets when they fall below a balance threshold', async () => {
    const { fiatBalancesAtom, nonDustBalanceAssetNamesAtom } = prepare()

    fiatBalancesAtom.set({
      balances: {
        byAssetSource: {
          exodus_0: {
            solana: { balance: fiatCurrencies.USD.defaultUnit(0.51) },
          },
        },
      },
    })

    await waitUntil({
      atom: nonDustBalanceAssetNamesAtom,
      predicate: (assetNames) => isEqual(assetNames, ['solana']),
    })

    fiatBalancesAtom.set({
      balances: {
        byAssetSource: {
          exodus_0: {
            solana: { balance: fiatCurrencies.USD.defaultUnit(0.49) },
          },
        },
      },
    })

    await waitUntil({
      atom: nonDustBalanceAssetNamesAtom,
      predicate: (assetNames) => assetNames.length === 0,
    })
  })

  it('tracks assets with balance > common threshold', async () => {
    const { fiatBalancesAtom, nonDustBalanceAssetNamesAtom } = prepare({
      config: {
        defaultBalanceThresholdUsd: fiatCurrencies.USD.defaultUnit(0.01),
      },
    })

    fiatBalancesAtom.set({
      balances: {
        byAssetSource: {
          exodus_0: {
            solana: { balance: fiatCurrencies.USD.defaultUnit(0.51) },
          },
        },
      },
    })

    await waitUntil({
      atom: nonDustBalanceAssetNamesAtom,
      predicate: (assetNames) => isEqual(assetNames, ['solana']),
    })
  })

  it('tracks assets with balance > per asset custom threshold', async () => {
    const { fiatBalancesAtom, nonDustBalanceAssetNamesAtom } = await prepare({
      config: {
        balanceThresholdsUsd: {
          solana: fiatCurrencies.USD.defaultUnit(0.01),
        },
        balanceThresholdByChainUsd: {
          solana: fiatCurrencies.USD.defaultUnit(1), // ignored
        },
      },
    })

    fiatBalancesAtom.set({
      balances: {
        byAssetSource: {
          exodus_0: {
            solana: { balance: fiatCurrencies.USD.defaultUnit(0.1) },
          },
        },
      },
    })

    await waitUntil({
      atom: nonDustBalanceAssetNamesAtom,
      predicate: (assetNames) => isEqual(assetNames, ['solana']),
    })
  })

  it('does not track assets with balance < per asset custom threshold', async () => {
    const { fiatBalancesAtom, nonDustBalanceAssetNamesAtom } = await prepare({
      config: {
        balanceThresholdsUsd: {
          ethereum: fiatCurrencies.USD.defaultUnit(0.01),
          solana: fiatCurrencies.USD.defaultUnit(0.01),
        },
        balanceThresholdByChainUsd: {
          solana: fiatCurrencies.USD.defaultUnit(0.0001), // ignored
        },
      },
    })

    fiatBalancesAtom.set({
      balances: {
        byAssetSource: {
          exodus_0: {
            ethereum: { balance: fiatCurrencies.USD.defaultUnit(0.01) },
            solana: { balance: fiatCurrencies.USD.defaultUnit(0.001) },
          },
        },
      },
    })

    await waitUntil({
      atom: nonDustBalanceAssetNamesAtom,
      predicate: (assetNames) => isEqual(assetNames, ['ethereum']),
    })
  })

  it('tracks assets with balance > per chain custom threshold', async () => {
    const { fiatBalancesAtom, nonDustBalanceAssetNamesAtom } = await prepare({
      config: {
        balanceThresholdByChainUsd: {
          solana: fiatCurrencies.USD.defaultUnit(0.01),
        },
      },
    })

    fiatBalancesAtom.set({
      balances: {
        byAssetSource: {
          exodus_0: {
            solana: { balance: fiatCurrencies.USD.defaultUnit(0.1) },
          },
        },
      },
    })

    await waitUntil({
      atom: nonDustBalanceAssetNamesAtom,
      predicate: (assetNames) => isEqual(assetNames, ['solana']),
    })
  })

  it('does not track assets with balance < per chain custom threshold', async () => {
    const { fiatBalancesAtom, nonDustBalanceAssetNamesAtom } = await prepare({
      config: {
        balanceThresholdByChainUsd: {
          ethereum: fiatCurrencies.USD.defaultUnit(0.01),
          solana: fiatCurrencies.USD.defaultUnit(0.01),
        },
      },
    })

    fiatBalancesAtom.set({
      balances: {
        byAssetSource: {
          exodus_0: {
            ethereum: { balance: fiatCurrencies.USD.defaultUnit(0.01) },
            solana: { balance: fiatCurrencies.USD.defaultUnit(0.001) },
          },
        },
      },
    })

    await waitUntil({
      atom: nonDustBalanceAssetNamesAtom,
      predicate: (assetNames) => isEqual(assetNames, ['ethereum']),
    })
  })
})
