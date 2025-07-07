import { assetsListToObject, connectAssets } from '@exodus/assets'
import _assets from '@exodus/assets-base'
import { pick } from '@exodus/basic-utils'
import _combinedAssets from '@exodus/combined-assets-meta'
import { WalletAccount } from '@exodus/models'

import { createFiatNumberUnit, setup } from '../../../utils.js'

const assets = connectAssets({ ..._assets, ...assetsListToObject(_combinedAssets) })

describe('sorted assets selectors', () => {
  const assetsList = ['ethereum', 'usdcoin', '_usdcoin', 'usdcoin_solana']

  const balances = {
    exodus_0: {
      ethereum: { total: assets.ethereum.currency.defaultUnit(10) },
      usdcoin: { total: assets.usdcoin.currency.defaultUnit(5) },
      usdcoin_solana: { total: assets.usdcoin_solana.currency.defaultUnit(10) },
      usdcoin_algorand: { total: assets.usdcoin_algorand.currency.defaultUnit(100) },
    },
  }

  const fiatBalances = {
    byAssetSource: {
      exodus_0: {
        ethereum: { balance: createFiatNumberUnit(100) },
        usdcoin: { balance: createFiatNumberUnit(5) },
        usdcoin_solana: { balance: createFiatNumberUnit(10) },
        usdcoin_algorand: { balance: createFiatNumberUnit(100) },
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
      emitBalances,
      emitFavoriteAssets,
      emitAssets: _emitAssets,
      emitWalletAccounts,
      emitEnabledAssets,
    } = setup()

    emitEnabledAssets({
      usdcoin: true,
      ethereum: true,
      usdcoin_solana: true,
      usdcoin_algorand: false,
    })
    emitBalances(balances)
    emitFiatBalances(fiatBalances)
    emitFavoriteAssets({})
    _emitAssets(pick(assets, assetsList))
    emitWalletAccounts({
      exodus_0: WalletAccount.DEFAULT,
      exodus_1: { ...WalletAccount.DEFAULT, index: 1 },
    })

    store = _store
    selectors = _selectors
  })

  test('sortedAssetsWithParentCombinedWithBalanceInActiveAccount returns sorted assets with balance in active account', () => {
    const assetsWithBalance =
      selectors.fiatBalances.sortedEnabledAssetsWithParentCombinedWithBalanceInActiveAccount

    const result = assetsWithBalance(store.getState())

    expect(
      result.map((item) => ({
        name: item.name,
        balance: item.balance.toDefaultString({ unit: true }),
        fiatValue: item.fiatValue.toDefaultString({ unit: true }),
      }))
    ).toEqual([
      {
        balance: '10 ETH',
        fiatValue: '100 USD',
        name: 'ethereum',
      },
      {
        balance: '15 _usdcoin_USDC',
        fiatValue: '15 USD',
        name: '_usdcoin',
      },
    ])

    expect(
      result[1].combinedAssets.map((item) => ({
        name: item.name,
        balance: item.balance.toDefaultString({ unit: true }),
        fiatValue: item.fiatValue.toDefaultString({ unit: true }),
      }))
    ).toEqual([
      {
        balance: '5 USDC',
        fiatValue: '5 USD',
        name: 'usdcoin',
      },
      {
        balance: '10 USDCSOL',
        fiatValue: '10 USD',
        name: 'usdcoin_solana',
      },
    ])
  })

  test('sortedAssetsWithParentCombinedWithBalanceInActiveAccount works without optional deps', () => {
    const {
      store: _store,
      selectors: _selectors,
      emitFiatBalances,
      emitBalances,
      emitFavoriteAssets,
      emitAssets: _emitAssets,
      emitWalletAccounts,
      emitEnabledAssets,
    } = setup({ hasTrustedRedux: false, hasUnverifiedRedux: false })

    emitEnabledAssets({
      usdcoin: true,
      ethereum: true,
      usdcoin_solana: true,
      usdcoin_algorand: false,
    })
    emitBalances(balances)
    emitFiatBalances(fiatBalances)
    emitFavoriteAssets({})
    _emitAssets(pick(assets, assetsList))
    emitWalletAccounts({
      exodus_0: WalletAccount.DEFAULT,
      exodus_1: { ...WalletAccount.DEFAULT, index: 1 },
    })

    store = _store
    selectors = _selectors
    const assetsWithBalance =
      selectors.fiatBalances.sortedEnabledAssetsWithParentCombinedWithBalanceInActiveAccount

    const result = assetsWithBalance(store.getState())

    expect(
      result.map((item) => ({
        name: item.name,
        balance: item.balance.toDefaultString({ unit: true }),
        fiatValue: item.fiatValue.toDefaultString({ unit: true }),
      }))
    ).toEqual([
      {
        balance: '10 ETH',
        fiatValue: '100 USD',
        name: 'ethereum',
      },
      {
        balance: '15 _usdcoin_USDC',
        fiatValue: '15 USD',
        name: '_usdcoin',
      },
    ])

    expect(
      result[1].combinedAssets.map((item) => ({
        name: item.name,
        balance: item.balance.toDefaultString({ unit: true }),
        fiatValue: item.fiatValue.toDefaultString({ unit: true }),
      }))
    ).toEqual([
      {
        balance: '5 USDC',
        fiatValue: '5 USD',
        name: 'usdcoin',
      },
      {
        balance: '10 USDCSOL',
        fiatValue: '10 USD',
        name: 'usdcoin_solana',
      },
    ])
  })
})
