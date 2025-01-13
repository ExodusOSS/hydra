import { WalletAccount } from '@exodus/models'

import createStateHelperAndSelectors from '../src/index.js'

describe('multi-account helper', () => {
  const initialWalletAccountsState = {
    loaded: false,
    // flag while replacing all data with data in fusion
    data: {
      [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT,
    },
  }

  const assetNames = ['bitcoin', 'ethereum', 'solana']

  const createInitialPerAssetData = (assetName) => ({ hodl: true })

  let activeWalletAccount = WalletAccount.DEFAULT_NAME

  const helper = createStateHelperAndSelectors({
    slice: 'txLog',
    assetNames,
    createInitialPerAssetData,
    activeWalletAccountSelector: () => activeWalletAccount,
  })

  test('initialState', () => {
    expect(Object.keys(helper.createInitialState()['exodus_0']).sort()).toEqual([
      'data',
      'error',
      'loaded',
    ])

    expect(helper.createInitialState()['exodus_0'].data.bitcoin).toEqual(
      createInitialPerAssetData('bitcoin')
    )
  })

  test('createInitialAssetsData', () => {
    expect(Object.keys(helper.createInitialAssetsData())).toEqual(assetNames)
  })

  test('getAccount', () => {
    expect(() => {
      helper.getAccount({})
    }).toThrow('expected walletAccount')

    const data = { billions: '140' }
    expect(helper.getAccount({ bezos_trezor: data }, 'bezos_trezor')).toEqual(data)
  })

  test('updateAccount', () => {
    expect(() => {
      helper.updateAccount({})
    }).toThrow('expected walletAccount')

    const before = { maxs_trezor: { billions: '0' }, bezos_trezor: { billions: '140' } }
    const after = { maxs_trezor: { billions: '5' }, bezos_trezor: { billions: '140' } }
    expect(helper.updateAccount(before, 'maxs_trezor', { billions: '5' })).toEqual(after)
  })

  test('resetAccount', () => {
    expect(() => {
      helper.resetAccount({})
    }).toThrow('expected walletAccount')

    const state = { maxs_trezor: { billions: '0' }, bezos_trezor: { billions: '140' } }
    const reset = helper.resetAccount(state, 'maxs_trezor')
    expect(helper.getAccount(reset, 'bezos_trezor')).toEqual({ billions: '140' })
    expect(Object.keys(reset['maxs_trezor']).sort()).toEqual(['data', 'error', 'loaded'])
    expect(Object.keys(reset['maxs_trezor'].data)).toEqual(assetNames)
  })

  test('setLoaded', () => {
    expect(() => {
      helper.setLoaded({})
    }).toThrow('expected walletAccount')

    const state = helper.createInitialState()
    expect(state['exodus_0'].loaded).toEqual(false)
    const newState = helper.setLoaded(state, 'exodus_0', { bitcoin: ['1337'] })
    expect(newState['exodus_0'].loaded).toEqual(true)
    expect(newState['exodus_0'].error).toEqual(null)

    state['exodus_0'].loaded = true
    state['exodus_0'].data = { bitcoin: ['1337'] }
    state['exodus_0'].loading = false
    expect(state).toEqual(newState)
  })

  test('setLoadingError', () => {
    expect(() => {
      helper.setLoadingError({})
    }).toThrow('expected walletAccount')

    const state = helper.createInitialState()
    expect(state['exodus_0'].error).toEqual(null)
    const newState = helper.setLoadingError(state, 'exodus_0', 'oops')
    state['exodus_0'].error = 'oops'
    state['exodus_0'].loading = false
    expect(state).toEqual(newState)
  })

  test('getAssets', () => {
    expect(() => {
      helper.getAssets({})
    }).toThrow('expected walletAccount')

    expect(Object.keys(helper.getAssets(helper.createInitialState(), 'exodus_0'))).toEqual(
      assetNames
    )
  })

  test('getAsset/setAsset/resetAsset', () => {
    expect(() => {
      helper.getAsset({})
    }).toThrow('expected walletAccount')
    expect(() => {
      helper.getAsset({}, 'exodus_0')
    }).toThrow('expected assetName')
    const state = helper.setAsset(helper.createInitialState(), 'exodus_0', 'bitcoin', ['1 billion'])
    expect(helper.getAsset(state, 'exodus_0', 'bitcoin')).toEqual(['1 billion'])
    const reset = helper.resetAsset(state, 'exodus_0', 'bitcoin')
    expect(helper.getAsset(reset, 'exodus_0', 'bitcoin').hodl).toEqual(true)
  })

  test('assetSelector', () => {
    const state = {
      txLog: helper.setAsset(helper.createInitialState(), 'exodus_0', 'bitcoin', [1337]),
    }
    expect(helper.assetSelector(state)('bitcoin')).toEqual([1337])
  })

  test('getAssetSourceSelector', () => {
    const state = {
      txLog: helper.setAsset(helper.createInitialState(), 'exodus_0', 'bitcoin', [1337]),
    }
    expect(
      helper.getAssetSourceSelector({ walletAccount: 'exodus_0', asset: 'bitcoin' })(state)
    ).toEqual([1337])
  })

  test('getActiveAccountAssetSelector', () => {
    const state = {
      txLog: helper.setAsset(helper.createInitialState(), 'exodus_0', 'bitcoin', [1337]),
      config: {
        data: {
          config: {
            activeWalletAccount: 'exodus_0',
          },
        },
      },
    }
    expect(helper.getActiveAccountAssetSelector('bitcoin')(state)).toEqual([1337])

    const exodus1 = new WalletAccount({
      source: 'exodus',
      index: 1,
    })

    const state1 = {
      walletAccounts: {
        ...initialWalletAccountsState,
        data: {
          ...initialWalletAccountsState.data,
          [exodus1]: exodus1,
        },
      },
      txLog: helper.setAsset(helper.createInitialState(), 'exodus_0', 'bitcoin', [1337]),
    }

    activeWalletAccount = 'exodus_1'
    expect(helper.getActiveAccountAssetSelector('bitcoin')(state1).hodl).toEqual(true)
  })

  test('loadedSelector', () => {
    const beforeLoaded = {
      txLog: helper.createInitialState(),
    }

    expect(helper.loadedSelector(beforeLoaded)('exodus_0')).toEqual(false)
    expect(helper.loadedSelector(beforeLoaded)('not_a_real_account')).toEqual(false)

    const afterLoaded = {
      txLog: helper.setLoaded(helper.createInitialState(), 'exodus_0'),
    }

    expect(helper.loadedSelector(afterLoaded)('exodus_0')).toEqual(true)
  })
})
