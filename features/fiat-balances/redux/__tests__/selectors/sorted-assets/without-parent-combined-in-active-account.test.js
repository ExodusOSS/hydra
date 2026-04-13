import { connectAssets } from '@exodus/assets'
import _assets from '@exodus/assets-base'
import { pick } from '@exodus/basic-utils'

import { createFiatNumberUnit, setup } from '../../utils.js'

const assets = connectAssets(_assets)

describe('sortedAssetsWithoutParentCombinedInActiveAccount', () => {
  const assetsList = ['ethereum', 'aave', 'exit', 'usdcoin']
  const waynecoin = {
    name: 'waynecoin',
    isCombined: true,
    baseAsset: { name: 'waynecoin' },
    combinedAssets: [{ name: 'batcoin' }, { name: 'jokercoin' }],
    combinedAssetNames: ['batcoin', 'jokercoin'],
  }

  const balances = {
    exodus_0: {
      ethereum: { total: assets.ethereum.currency.defaultUnit(1) },
      aave: { total: assets.aave.currency.defaultUnit(1) },
      exit: { total: assets.exit.currency.defaultUnit(1) },
      usdcoin: { total: assets.usdcoin.currency.defaultUnit(0) },
    },
  }

  const fiatBalances = {
    byAssetSource: {
      exodus_0: {
        ethereum: createFiatNumberUnit(100),
        aave: createFiatNumberUnit(99),
        exit: createFiatNumberUnit(5),
        usdcoin: createFiatNumberUnit(0),
      },
    },
  }

  const rates = {
    USD: {
      [assets.ethereum.ticker]: {
        cap: 999,
      },
      [assets.aave.ticker]: {
        cap: 99,
      },
      [assets.exit.ticker]: {
        cap: 10,
      },
      [assets.usdcoin.ticker]: {
        cap: 10_000,
      },
    },
  }

  test('returns sorted assets without combined assets', () => {
    const {
      store,
      selectors,
      emitFiatBalances,
      emitBalances,
      emitFavoriteAssets,
      emitRates,
      emitAssets,
    } = setup()

    const sortedAssetsSelector =
      selectors.fiatBalances.sortedAssetsWithoutParentCombinedInActiveAccount

    emitBalances(balances)
    emitFiatBalances(fiatBalances)
    emitFavoriteAssets({ aave: true, zerox: true })
    emitRates(rates)
    emitAssets({
      ...pick(assets, assetsList),
      waynecoin,
    })

    const result = sortedAssetsSelector(store.getState())

    expect(result.map((a) => a.name)).toEqual(['aave', 'ethereum', 'exit', 'usdcoin'])
  })
})
