import { connectAssets } from '@exodus/assets'
import _assets from '@exodus/assets-base'

import { createFiatNumberUnit, setup } from '../utils'

const assets = connectAssets(_assets)

describe('createSortAssetsSelectorFactory', () => {
  const assetsList = [
    'bitcoin',
    'tetherusd',
    'ethereum',
    'leo',
    'oneinch',
    'zerox',
    'exit',
    'usdcoin',
    'busd',
    'mcd',
  ].map((name) => assets[name])

  const balances = {
    exodus_0: {
      ethereum: { balance: assets.ethereum.currency.defaultUnit(1) },
      bitcoin: { balance: assets.bitcoin.currency.defaultUnit(0) },
      leo: { balance: assets.leo.currency.defaultUnit(1) },
      oneinch: { balance: assets.oneinch.currency.defaultUnit(1) },
      zerox: { balance: assets.zerox.currency.defaultUnit(1) },
      exit: { balance: assets.exit.currency.defaultUnit(1) },
      usdcoin: { balance: assets.usdcoin.currency.defaultUnit(3) },
      busd: { balance: assets.busd.currency.defaultUnit(0) },
      mcd: { balance: assets.mcd.currency.defaultUnit(0) },
    },
  }

  const fiatBalances = {
    byAssetSource: {
      exodus_0: {
        ethereum: { balance: createFiatNumberUnit(100) },
        bitcoin: { balance: createFiatNumberUnit(0) },
        leo: { balance: createFiatNumberUnit(99) },
        oneinch: { balance: createFiatNumberUnit(98) },
        zerox: { balance: createFiatNumberUnit(5) },
        exit: { balance: createFiatNumberUnit(5) },
        usdcoin: { balance: createFiatNumberUnit(3) },
        busd: { balance: createFiatNumberUnit(0) },
        mcd: { balance: createFiatNumberUnit(0) },
      },
    },
  }

  const rates = {
    USD: {
      [assets.ethereum.ticker]: {
        cap: 999,
      },
      [assets.bitcoin.ticker]: {
        cap: 99_999,
      },
      [assets.leo.ticker]: {
        cap: 99,
      },
      [assets.oneinch.ticker]: {
        cap: 50,
      },
      [assets.zerox.ticker]: {
        cap: 50,
      },
      [assets.exit.ticker]: {
        cap: 10,
      },
      [assets.usdcoin.ticker]: {
        cap: 10_000,
      },
      [assets.busd.ticker]: {
        cap: 100,
      },
      [assets.mcd.ticker]: {
        cap: 50,
      },
    },
  }

  test('returns sorted assets', () => {
    const { store, selectors, emitFiatBalances, emitBalances, emitFavoriteAssets, emitRates } =
      setup()
    const assetListSelector = () => assetsList
    const createSelectorFactory = selectors.fiatBalances.createSortAssetsSelectorFactory
    const createSelector = createSelectorFactory(assetListSelector)
    const sortedAssetsSelector = createSelector('exodus_0')

    emitBalances(balances)
    emitFiatBalances(fiatBalances)
    emitFavoriteAssets({ leo: true, zerox: true })
    emitRates(rates)

    const result = sortedAssetsSelector(store.getState())

    expect(result.map((a) => a.name)).toEqual([
      'leo',
      'zerox',
      'ethereum',
      'oneinch',
      'exit',
      'usdcoin',
      'bitcoin',
      'busd',
      'mcd',
      'tetherusd',
    ])
  })
})
