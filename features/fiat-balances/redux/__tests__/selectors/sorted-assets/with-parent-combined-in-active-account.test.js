import { assetsListToObject, connectAssets } from '@exodus/assets'
import _assets from '@exodus/assets-base'
import { pick } from '@exodus/basic-utils'
import _combinedAssets from '@exodus/combined-assets-meta'

import { createFiatNumberUnit, setup } from '../../utils.js'

const assets = connectAssets({ ..._assets, ...assetsListToObject(_combinedAssets) })

describe('sortedAssetsWithParentCombinedInActiveAccount', () => {
  const assetsList = ['ethereum', 'usdcoin', 'usdcoin_solana', '_usdcoin']

  const balances = {
    exodus_0: {
      ethereum: { total: assets.ethereum.currency.defaultUnit(1) },
      usdcoin: { total: assets.usdcoin.currency.defaultUnit(5) },
      usdcoin_solana: { total: assets.usdcoin_solana.currency.defaultUnit(15) },
    },
  }

  const fiatBalances = {
    byAssetSource: {
      exodus_0: {
        ethereum: createFiatNumberUnit(100),
        usdcoin: createFiatNumberUnit(5),
        usdcoin_solana: createFiatNumberUnit(15),
      },
    },
  }

  const rates = {
    USD: {
      [assets.ethereum.ticker]: {
        cap: 999,
      },
      [assets.usdcoin.ticker]: {
        cap: 10_000,
      },
    },
  }

  test('returns sorted assets with combined assets', () => {
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
      selectors.fiatBalances.sortedAssetsWithParentCombinedInActiveAccount

    emitBalances(balances)
    emitFiatBalances(fiatBalances)
    emitFavoriteAssets({})
    emitRates(rates)
    const assetsToEmit = pick(assets, assetsList)
    emitAssets(assetsToEmit)

    const result = sortedAssetsSelector(store.getState())

    expect(result.map((a) => a.name)).toEqual(['_usdcoin', 'ethereum'])
  })
})
