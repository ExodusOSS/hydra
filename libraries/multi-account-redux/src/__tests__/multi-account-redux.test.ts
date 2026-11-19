import { WalletAccount } from '@exodus/models'

import createStateHelperAndSelectors from '../index.js'

describe('multi-account helper', () => {
  const initialWalletAccountsState = {
    loaded: false,
    // flag while replacing all data with data in fusion
    data: {
      [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT,
    },
  }

  const assetNames = ['bitcoin', 'ethereum', 'solana']

  const createInitialPerAssetData = (_assetName: string) => ({ hodl: true })

  let activeWalletAccount = WalletAccount.DEFAULT_NAME

  const helper = createStateHelperAndSelectors({
    slice: 'txLog',
    assetNames,
    createInitialPerAssetData,
    activeWalletAccountSelector: () => activeWalletAccount,
  } as never) // allow: helper is generic over <TSlice, TRootState>; this test never exercises selectors needing root state, so an explicit RootState binding is unnecessary noise.

  const looseHelper = helper as any // allow: runtime-guard tests deliberately invoke helpers with missing args; per-site typing buys no coverage.

  test('initialState', () => {
    expect(
      Object.keys(helper.createInitialState()['exodus_0']!).sort((a, b) => a.localeCompare(b))
    ).toEqual(['data', 'error', 'loaded'])

    expect(helper.createInitialState()['exodus_0']!.data['bitcoin']).toEqual(
      createInitialPerAssetData('bitcoin')
    )
  })

  test('createInitialAssetsData', () => {
    expect(Object.keys(helper.createInitialAssetsData())).toEqual(assetNames)
  })

  test('getAccount', () => {
    expect(() => {
      looseHelper.getAccount({})
    }).toThrow('expected walletAccount')

    const data = { billions: '140' }
    expect(looseHelper.getAccount({ bezos_trezor: data }, 'bezos_trezor')).toEqual(data)
  })

  test('updateAccount', () => {
    expect(() => {
      looseHelper.updateAccount({})
    }).toThrow('expected walletAccount')

    const before = { maxs_trezor: { billions: '0' }, bezos_trezor: { billions: '140' } }
    const after = { maxs_trezor: { billions: '5' }, bezos_trezor: { billions: '140' } }
    expect(looseHelper.updateAccount(before, 'maxs_trezor', { billions: '5' })).toEqual(after)
  })

  test('resetAccount', () => {
    expect(() => {
      looseHelper.resetAccount({})
    }).toThrow('expected walletAccount')

    const state = { maxs_trezor: { billions: '0' }, bezos_trezor: { billions: '140' } }
    const reset = looseHelper.resetAccount(state, 'maxs_trezor')
    expect(looseHelper.getAccount(reset, 'bezos_trezor')).toEqual({ billions: '140' })
    expect(Object.keys(reset['maxs_trezor']).sort((a, b) => a.localeCompare(b))).toEqual([
      'data',
      'error',
      'loaded',
    ])
    expect(Object.keys(reset['maxs_trezor'].data)).toEqual(assetNames)
  })

  test('setLoaded', () => {
    expect(() => {
      looseHelper.setLoaded({})
    }).toThrow('expected walletAccount')

    const state = helper.createInitialState()
    expect(state['exodus_0']!.loaded).toEqual(false)
    const newState = helper.setLoaded(state, 'exodus_0', { bitcoin: ['1337'] })
    expect(newState['exodus_0']!.loaded).toEqual(true)
    expect(newState['exodus_0']!.error).toEqual(null)

    state['exodus_0']!.loaded = true
    state['exodus_0']!.data = { bitcoin: ['1337'] }
    state['exodus_0']!.loading = false
    expect(state).toEqual(newState)
  })

  test('setLoadingError', () => {
    expect(() => {
      looseHelper.setLoadingError({})
    }).toThrow('expected walletAccount')

    const state = helper.createInitialState()
    expect(state['exodus_0']!.error).toEqual(null)
    const newState = helper.setLoadingError(state, 'exodus_0', 'oops')
    state['exodus_0']!.error = 'oops'
    state['exodus_0']!.loading = false
    expect(state).toEqual(newState)
  })

  test('getAssets', () => {
    expect(() => {
      looseHelper.getAssets({})
    }).toThrow('expected walletAccount')

    expect(Object.keys(helper.getAssets(helper.createInitialState(), 'exodus_0')!)).toEqual(
      assetNames
    )
  })

  test('getAsset/setAsset/resetAsset', () => {
    expect(() => {
      looseHelper.getAsset({})
    }).toThrow('expected walletAccount')
    expect(() => {
      looseHelper.getAsset({}, 'exodus_0')
    }).toThrow('expected assetName')
    const state = helper.setAsset(helper.createInitialState(), 'exodus_0', 'bitcoin', ['1 billion'])
    expect(helper.getAsset(state, 'exodus_0', 'bitcoin')).toEqual(['1 billion'])
    const reset = helper.resetAsset(state, 'exodus_0', 'bitcoin')
    expect((helper.getAsset(reset, 'exodus_0', 'bitcoin') as { hodl: boolean }).hodl).toEqual(true)
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
    expect(helper.getActiveAccountAssetSelector('bitcoin')(state as never)).toEqual([1337]) // allow: test fixture; helper is generic but this test omits a RootState binding for brevity.

    const exodus1 = new WalletAccount({
      source: 'exodus',
      index: 1,
    })

    const state1 = {
      walletAccounts: {
        ...initialWalletAccountsState,
        data: {
          ...initialWalletAccountsState.data,
          [String(exodus1)]: exodus1,
        },
      },
      txLog: helper.setAsset(helper.createInitialState(), 'exodus_0', 'bitcoin', [1337]),
    }

    activeWalletAccount = 'exodus_1'
    const state1AsNever = state1 as never // allow: helper omits a RootState binding; test fixture state is a partial shape.
    const result = helper.getActiveAccountAssetSelector('bitcoin')(state1AsNever) as {
      hodl: boolean
    } // allow: selector returns the per-asset shape registered by createInitialPerAssetData.
    expect(result.hodl).toEqual(true)
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
