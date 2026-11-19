import { connectAssets } from '@exodus/assets'
import _assets from '@exodus/assets-base'
import { pick } from '@exodus/basic-utils'
import { WalletAccount } from '@exodus/models'

import { createFiatNumberUnit, setup } from '../../utils.js'

const assets = connectAssets(_assets)

describe('sorted optimistic assets selectors', () => {
  const assetsList = ['ethereum', 'algorand']

  const balances = {
    exodus_0: {
      ethereum: { total: assets.ethereum.currency.defaultUnit(1) },
      algorand: { total: assets.algorand.currency.defaultUnit(1) },
    },
  }

  const canonicalFiatBalances = {
    byAssetSource: {
      exodus_0: {
        ethereum: { balance: createFiatNumberUnit(40) },
        algorand: { balance: createFiatNumberUnit(50) },
      },
    },
  }

  const optimisticFiatBalances = {
    byAssetSource: {
      exodus_0: {
        ethereum: { balance: createFiatNumberUnit(60) },
        algorand: { balance: createFiatNumberUnit(50) },
      },
    },
  }

  let selectors
  let store

  beforeEach(() => {
    const {
      store: _store,
      selectors: _selectors,
      emitFiatBalances,
      emitOptimisticFiatBalances,
      emitBalances,
      emitFavoriteAssets,
      emitAssets,
      emitWalletAccounts,
    } = setup({ optimisticActivityEnabled: true })

    emitWalletAccounts({ exodus_0: WalletAccount.DEFAULT })
    emitAssets(pick(assets, assetsList))
    emitFavoriteAssets({})
    emitBalances(balances)
    emitFiatBalances(canonicalFiatBalances)
    emitOptimisticFiatBalances(optimisticFiatBalances)

    store = _store
    selectors = _selectors
  })

  test('sortedOptimisticAssetsWithBalanceInActiveAccount orders by optimistic fiat (single source of truth)', () => {
    const sorted = selectors.fiatBalances.sortedOptimisticAssetsWithBalanceInActiveAccount(
      store.getState()
    )

    expect(sorted.map((a) => a.name)).toEqual(['ethereum', 'algorand'])
  })
})
