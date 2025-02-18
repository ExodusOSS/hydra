import { connectAssets } from '@exodus/assets'
import _assets from '@exodus/assets-base'
import { pick } from '@exodus/basic-utils'
import { WalletAccount } from '@exodus/models'

import { createFiatNumberUnit, setup } from '../../utils'

const assets = connectAssets(_assets)

describe('sorted assets selectors', () => {
  const assetsList = ['ethereum', 'leo', 'exit', 'solana', 'usdcoin']

  const balances = {
    exodus_0: {
      ethereum: { total: assets.ethereum.currency.defaultUnit(10) },
      leo: { total: assets.leo.currency.defaultUnit(20) },
      exit: { total: assets.exit.currency.defaultUnit(30) },
      solana: { total: assets.solana.currency.defaultUnit(0) },
      usdcoin: { total: assets.usdcoin.currency.defaultUnit(0) },
    },
    exodus_1: {
      ethereum: { total: assets.ethereum.currency.defaultUnit(5) },
      leo: { total: assets.leo.currency.defaultUnit(3) },
      exit: { total: assets.exit.currency.defaultUnit(2) },
      solana: { total: assets.solana.currency.defaultUnit(0) },
      usdcoin: { total: assets.usdcoin.currency.defaultUnit(0) },
    },
  }

  const fiatBalances = {
    byAssetSource: {
      exodus_0: {
        ethereum: { balance: createFiatNumberUnit(100) },
        leo: { balance: createFiatNumberUnit(99) },
        exit: { balance: createFiatNumberUnit(5) },
        solana: { balance: createFiatNumberUnit(0) },
        usdcoin: { balance: createFiatNumberUnit(0) },
      },
      exodus_1: {
        ethereum: { balance: createFiatNumberUnit(5) },
        leo: { balance: createFiatNumberUnit(8) },
        exit: { balance: createFiatNumberUnit(51) },
        solana: { balance: createFiatNumberUnit(0) },
        usdcoin: { balance: createFiatNumberUnit(0) },
      },
    },
  }

  let selectors
  let store
  let emitEnabledAssets
  let emitFavoriteAssets
  let emitAssets
  let setUnverifiedToken

  beforeEach(() => {
    const {
      store: _store,
      selectors: _selectors,
      emitEnabledAssets: _emitEnabledAssets,
      setUnverifiedToken: _setUnverifiedToken,
      emitFiatBalances,
      emitBalances,
      emitFavoriteAssets: _emitFavoriteAssets,
      emitAssets: _emitAssets,
      emitWalletAccounts,
    } = setup()

    emitBalances(balances)
    emitFiatBalances(fiatBalances)
    _emitFavoriteAssets({ leo: true })
    _emitAssets(pick(assets, assetsList))
    emitWalletAccounts({
      exodus_0: WalletAccount.DEFAULT,
      exodus_1: { ...WalletAccount.DEFAULT, index: 1 },
    })

    store = _store
    selectors = _selectors
    emitEnabledAssets = _emitEnabledAssets
    emitFavoriteAssets = _emitFavoriteAssets
    setUnverifiedToken = _setUnverifiedToken
    emitAssets = _emitAssets
  })

  test('sortedAssetsWithBalanceInActiveAccount returns sorted assets with balance in active account', () => {
    const assetsWithBalance = selectors.fiatBalances.sortedAssetsWithBalanceInActiveAccount

    const result = assetsWithBalance(store.getState())

    expect(result).toEqual([
      expect.objectContaining({
        name: 'leo',
        balance: assets.leo.currency.defaultUnit(20),
        fiatValue: createFiatNumberUnit(99),
        formattedFiatValue: '$99.00',
      }),
      expect.objectContaining({
        name: 'ethereum',
        balance: assets.ethereum.currency.defaultUnit(10),
        fiatValue: createFiatNumberUnit(100),
        formattedFiatValue: '$100.00',
      }),
      expect.objectContaining({
        name: 'exit',
        balance: assets.exit.currency.defaultUnit(30),
        fiatValue: createFiatNumberUnit(5),
        formattedFiatValue: '$5.00',
      }),
      expect.objectContaining({
        name: 'solana',
        balance: assets.solana.currency.defaultUnit(0),
        fiatValue: createFiatNumberUnit(0),
        formattedFiatValue: '$0',
      }),
      expect.objectContaining({
        name: 'usdcoin',
        balance: assets.usdcoin.currency.defaultUnit(0),
        fiatValue: createFiatNumberUnit(0),
        formattedFiatValue: '$0',
      }),
    ])
  })

  test('sortedAssetsWithBalanceInActiveAccount returns assets with balance before favorite assets with 0 balance', () => {
    emitFavoriteAssets({ leo: true, usdcoin: true })

    const assetsWithBalance = selectors.fiatBalances.sortedAssetsWithBalanceInActiveAccount

    const result = assetsWithBalance(store.getState())

    expect(result).toEqual([
      expect.objectContaining({
        name: 'leo',
        balance: assets.leo.currency.defaultUnit(20),
        fiatValue: createFiatNumberUnit(99),
        formattedFiatValue: '$99.00',
      }),
      expect.objectContaining({
        name: 'ethereum',
        balance: assets.ethereum.currency.defaultUnit(10),
        fiatValue: createFiatNumberUnit(100),
        formattedFiatValue: '$100.00',
      }),
      expect.objectContaining({
        name: 'exit',
        balance: assets.exit.currency.defaultUnit(30),
        fiatValue: createFiatNumberUnit(5),
        formattedFiatValue: '$5.00',
      }),
      expect.objectContaining({
        name: 'usdcoin',
        balance: assets.usdcoin.currency.defaultUnit(0),
        fiatValue: createFiatNumberUnit(0),
        formattedFiatValue: '$0',
      }),
      expect.objectContaining({
        name: 'solana',
        balance: assets.solana.currency.defaultUnit(0),
        fiatValue: createFiatNumberUnit(0),
        formattedFiatValue: '$0',
      }),
    ])
  })

  test('sortedAssetsWithTotalBalance returns sorted assets with balance across all wallet accounts', () => {
    const assetsWithBalance = selectors.fiatBalances.sortedAssetsWithTotalBalance

    const result = assetsWithBalance(store.getState())

    expect(result).toEqual([
      expect.objectContaining({
        name: 'leo',
        balance: assets.leo.currency.defaultUnit(23),
        fiatValue: createFiatNumberUnit(107),
        formattedFiatValue: '$107.00',
      }),
      expect.objectContaining({
        name: 'ethereum',
        balance: assets.ethereum.currency.defaultUnit(15),
        fiatValue: createFiatNumberUnit(105),
        formattedFiatValue: '$105.00',
      }),
      expect.objectContaining({
        name: 'exit',
        balance: assets.exit.currency.defaultUnit(32),
        fiatValue: createFiatNumberUnit(56),
        formattedFiatValue: '$56.00',
      }),
      expect.objectContaining({
        name: 'solana',
        balance: assets.solana.currency.defaultUnit(0),
        fiatValue: createFiatNumberUnit(0),
        formattedFiatValue: '$0',
      }),
      expect.objectContaining({
        name: 'usdcoin',
        balance: assets.usdcoin.currency.defaultUnit(0),
        fiatValue: createFiatNumberUnit(0),
        formattedFiatValue: '$0',
      }),
    ])
  })

  test('sortedAssetsWithTotalBalance returns sorted enabled assets with total balance', () => {
    emitEnabledAssets({ leo: true, ethereum: true })

    const assetsWithBalance = selectors.fiatBalances.sortedEnabledAssetsWithTotalBalance
    const result = assetsWithBalance(store.getState())

    expect(result).toEqual([
      expect.objectContaining({
        name: 'leo',
        balance: assets.leo.currency.defaultUnit(23),
        fiatValue: createFiatNumberUnit(107),
        formattedFiatValue: '$107.00',
      }),
      expect.objectContaining({
        name: 'ethereum',
        balance: assets.ethereum.currency.defaultUnit(15),
        fiatValue: createFiatNumberUnit(105),
        formattedFiatValue: '$105.00',
      }),
    ])
  })

  describe('sortedEnabledAssetsWithBalanceInActiveAccount', () => {
    test('returns sorted enabled assets', () => {
      emitEnabledAssets({ leo: true, ethereum: true })

      const assetsWithBalance = selectors.fiatBalances.sortedEnabledAssetsWithBalanceInActiveAccount
      const result = assetsWithBalance(store.getState())

      expect(result).toEqual([
        expect.objectContaining({
          name: 'leo',
          balance: assets.leo.currency.defaultUnit(20),
          fiatValue: createFiatNumberUnit(99),
          formattedFiatValue: '$99.00',
        }),
        expect.objectContaining({
          name: 'ethereum',
          balance: assets.ethereum.currency.defaultUnit(10),
          fiatValue: createFiatNumberUnit(100),
          formattedFiatValue: '$100.00',
        }),
      ])
    })

    test('returns unverified tokens', () => {
      emitEnabledAssets({ ethereum: true, exit: true })
      setUnverifiedToken('exit')

      const assetsWithBalance = selectors.fiatBalances.sortedEnabledAssetsWithBalanceInActiveAccount
      const result = assetsWithBalance(store.getState())

      expect(result).toEqual([
        expect.objectContaining({
          name: 'ethereum',
          balance: assets.ethereum.currency.defaultUnit(10),
          fiatValue: createFiatNumberUnit(100),
          formattedFiatValue: '$100.00',
        }),
        expect.objectContaining({
          name: 'exit',
          balance: assets.exit.currency.defaultUnit(30),
          fiatValue: createFiatNumberUnit(5),
          formattedFiatValue: '$5.00',
        }),
      ])
    })

    test('returns combined asset', () => {
      emitEnabledAssets({ waynecoin: true, jokercoin: true })
      const selection = pick(assets, assetsList)

      emitAssets({
        ...selection,
        ethereum: {
          ...selection.ethereum,
          assetType: 'MULTI_NETWORK_ASSET',
          combinedAssetNames: ['jokercoin', 'waynecoin'],
          combinedAssets: [
            { ...assets.ethereum, name: 'waynecoin' },
            { ...assets.ethereum, name: 'jokercoin' },
          ],
        },
      })

      const assetsWithBalance = selectors.fiatBalances.sortedEnabledAssetsWithBalanceInActiveAccount
      const result = assetsWithBalance(store.getState())

      expect(result.map((it) => it.name)).toEqual(['ethereum'])
    })

    test('returns first combined asset if only one present', () => {
      emitEnabledAssets({ waynecoin: true })
      const selection = pick(assets, assetsList)

      emitAssets({
        ...selection,
        ethereum: {
          ...selection.ethereum,
          assetType: 'MULTI_NETWORK_ASSET',
          combinedAssets: [{ ...assets.ethereum, name: 'waynecoin' }],
        },
      })

      const assetsWithBalance = selectors.fiatBalances.sortedEnabledAssetsWithBalanceInActiveAccount
      const result = assetsWithBalance(store.getState())

      expect(result.map((it) => it.name)).toEqual(['waynecoin'])
    })
  })
})
