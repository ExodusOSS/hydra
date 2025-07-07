import createReduxModuleHelper from '../src/create-definitions.js'
import { setup } from './utils.js'

describe('multi-account helper', () => {
  const createInitialPerAssetData = ({ asset }) => {
    expect(typeof asset.name).toEqual('string')
    return { hodl: true }
  }

  let store, selectors, emitActiveWalletAccount, handleEvent, helper, assets
  beforeEach(() => {
    helper = createReduxModuleHelper({
      slice: 'txLogs',
      createInitialPerAssetData,
    })
    ;({ store, selectors, emitActiveWalletAccount, handleEvent, assets } = setup({
      id: 'txLogs',
      type: 'redux-module',
      initialState: helper.createInitialState(),
      eventReducers: helper,
      selectorDefinitions: helper.selectorDefinitions,
    }))
  })

  test('initialState', () => {
    expect(Object.keys(helper.createInitialState()['exodus_0']).sort()).toEqual([
      'data',
      'error',
      'loaded',
    ])

    expect(store.getState().txLogs).toEqual(helper.createInitialState())
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
  })

  test('setLoaded', () => {
    expect(() => {
      handleEvent('setLoaded')
    }).toThrow('expected walletAccount')

    handleEvent('setLoaded', 'exodus_0')

    expect(store.getState().txLogs.exodus_0.loaded).toEqual(true)
    expect(store.getState().txLogs.exodus_0.error).toEqual(null)
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
      helper.getAssets(store.getState())
    }).toThrow('expected walletAccount')

    handleEvent('setAccounts', {
      exodus_0: { bitcoin: [1337] },
    })

    expect(helper.getAssets(store.getState().txLogs, 'exodus_0')).toEqual({ bitcoin: [1337] })
  })

  test('getAsset/setAsset/resetAsset', () => {
    expect(() => {
      helper.getAsset(store.getState())
    }).toThrow('expected walletAccount')
    expect(() => {
      helper.getAsset(store.getState(), 'exodus_0')
    }).not.toThrow()

    handleEvent('setAccounts', {
      exodus_0: { bitcoin: [1337] },
    })

    expect(helper.getAsset(store.getState().txLogs, 'exodus_0', assets.bitcoin)).toEqual([1337])
    handleEvent('resetAccount', 'exodus_0')
    expect(helper.getAsset(store.getState().txLogs, 'exodus_0', assets.bitcoin).hodl).toEqual(true)
  })

  test('createAccountAssetsSelector', () => {
    handleEvent('setAccounts', {
      exodus_0: { bitcoin: [1337] },
    })

    expect(selectors.txLogs.createAccountAssetsSelector('exodus_0')(store.getState())).toEqual({
      bitcoin: [1337],
    })
  })

  test('activeAccountAssetsSelector', () => {
    handleEvent('setAccounts', {
      exodus_0: { bitcoin: [1337] },
    })

    expect(selectors.txLogs.activeAccountAssetsSelector(store.getState())).toEqual({
      bitcoin: [1337],
    })
  })

  test('createActiveAssetSourceSelector', () => {
    handleEvent('setAccounts', {
      exodus_0: { bitcoin: [1337] },
    })

    expect(
      selectors.txLogs.createActiveAssetSourceSelectorOld(store.getState())('bitcoin')
    ).toEqual([1337])
    expect(selectors.txLogs.createActiveAssetSourceSelector('bitcoin')(store.getState())).toEqual([
      1337,
    ])
  })
  test('getAccountAssetsSelector', () => {
    handleEvent('setAccounts', {
      exodus_0: { bitcoin: [1337] },
    })

    expect(selectors.txLogs.getAccountAssetsSelector(store.getState())('exodus_0')).toEqual({
      bitcoin: [1337],
    })
  })

  test('createAssetSourceSelector', () => {
    handleEvent('setAccounts', {
      exodus_0: { bitcoin: [1337] },
    })

    expect(
      selectors.txLogs.createAssetSourceSelectorOld(store.getState())({
        walletAccount: 'exodus_0',
        assetName: 'bitcoin',
      })
    ).toEqual([1337])

    expect(
      selectors.txLogs.createAssetSourceSelector({
        walletAccount: 'exodus_0',
        assetName: 'bitcoin',
      })(store.getState())
    ).toEqual([1337])
  })

  test('createBaseAssetSourceSelector', () => {
    handleEvent('setAccounts', {
      exodus_0: { ethereum: [1337] },
    })

    expect(
      selectors.txLogs.createBaseAssetSourceSelectorOld(store.getState())({
        walletAccount: 'exodus_0',
        assetName: 'mcd',
      })
    ).toEqual([1337])

    expect(
      selectors.txLogs.createBaseAssetSourceSelector({
        walletAccount: 'exodus_0',
        assetName: 'mcd',
      })(store.getState())
    ).toEqual([1337])
  })

  test('createActiveAssetSourceSelector', () => {
    handleEvent('setAccounts', {
      exodus_0: { bitcoin: [1337] },
      exodus_1: { bitcoin: { hodl: true } },
    })

    expect(selectors.txLogs.createActiveAssetSourceSelector('bitcoin')(store.getState())).toEqual([
      1337,
    ])

    emitActiveWalletAccount('exodus_1')

    expect(selectors.txLogs.createActiveAssetSourceSelector('bitcoin')(store.getState())).toEqual({
      hodl: true,
    })
  })

  test('createActiveBaseAssetSourceSelector', () => {
    handleEvent('setAccounts', {
      exodus_0: { ethereum: [1337] },
      exodus_1: { ethereum: { hodl: true } },
    })

    expect(selectors.txLogs.createActiveBaseAssetSourceSelector('mcd')(store.getState())).toEqual([
      1337,
    ])

    emitActiveWalletAccount('exodus_1')

    expect(selectors.txLogs.createActiveBaseAssetSourceSelector('mcd')(store.getState())).toEqual({
      hodl: true,
    })
  })

  test('createIsWalletAccountLoadedSelector', () => {
    expect(
      selectors.txLogs.createIsWalletAccountLoadedSelectorOld(store.getState())('exodus_0')
    ).toEqual(false)
    expect(
      selectors.txLogs.createIsWalletAccountLoadedSelectorOld(store.getState())(
        'not_a_real_account'
      )
    ).toEqual(false)
    expect(
      selectors.txLogs.createIsWalletAccountLoadedSelector('exodus_0')(store.getState())
    ).toEqual(false)
    expect(
      selectors.txLogs.createIsWalletAccountLoadedSelector('not_a_real_account')(store.getState())
    ).toEqual(false)

    handleEvent('setAccounts', {
      exodus_0: { bitcoin: [1337] },
      exodus_1: { bitcoin: { hodl: true } },
    })

    expect(
      selectors.txLogs.createIsWalletAccountLoadedSelectorOld(store.getState())('exodus_0')
    ).toEqual(true)
    expect(
      selectors.txLogs.createIsWalletAccountLoadedSelector('exodus_0')(store.getState())
    ).toEqual(true)
  })

  test('isActiveWalletAccountLoaded', () => {
    expect(selectors.txLogs.isActiveWalletAccountLoaded(store.getState())).toEqual(false)

    handleEvent('setAccounts', {
      exodus_0: { bitcoin: [1337] },
    })

    expect(selectors.txLogs.isActiveWalletAccountLoaded(store.getState())).toEqual(true)
  })

  test('createIsWalletAccountLoadingSelector', () => {
    expect(
      selectors.txLogs.createIsWalletAccountLoadingSelectorOld(store.getState())('exodus_0')
    ).toEqual(false)
    expect(
      selectors.txLogs.createIsWalletAccountLoadingSelectorOld(store.getState())(
        'not_a_real_account'
      )
    ).toEqual(false)
    expect(
      selectors.txLogs.createIsWalletAccountLoadingSelector('exodus_0')(store.getState())
    ).toEqual(false)
    expect(
      selectors.txLogs.createIsWalletAccountLoadingSelector('not_a_real_account')(store.getState())
    ).toEqual(false)

    handleEvent('setLoading', 'exodus_1')

    expect(
      selectors.txLogs.createIsWalletAccountLoadingSelectorOld(store.getState())('exodus_0')
    ).toEqual(false)
    expect(
      selectors.txLogs.createIsWalletAccountLoadingSelector('exodus_0')(store.getState())
    ).toEqual(false)
    expect(
      selectors.txLogs.createIsWalletAccountLoadingSelectorOld(store.getState())('exodus_1')
    ).toEqual(true)
    expect(
      selectors.txLogs.createIsWalletAccountLoadingSelector('exodus_1')(store.getState())
    ).toEqual(true)
  })

  test('isActiveWalletAccountLoading', () => {
    expect(selectors.txLogs.isActiveWalletAccountLoading(store.getState())).toEqual(false)

    handleEvent('setLoading', 'exodus_0')

    expect(selectors.txLogs.isActiveWalletAccountLoading(store.getState())).toEqual(true)
  })

  test('assetSourceDataSelectors', () => {
    const createInitialPerAssetData = ({ asset }) => {
      expect(typeof asset.name).toEqual('string')
      return { foo: { bar: 'nested' } }
    }

    const assetSourceDataSelectors = [{ name: 'fooBar', selector: (asset) => asset.foo.bar }]

    helper = createReduxModuleHelper({
      slice: 'txLogs',
      createInitialPerAssetData,
      assetSourceDataSelectors,
    })
    ;({ store, selectors, emitActiveWalletAccount, handleEvent, assets } = setup({
      id: 'txLogs',
      type: 'redux-module',
      initialState: helper.createInitialState(),
      eventReducers: helper,
      selectorDefinitions: helper.selectorDefinitions,
    }))

    handleEvent('setAccounts', {
      exodus_0: { bitcoin: { foo: { bar: 'nested-bitcoin-data' } } },
    })

    const state = store.getState()

    expect(selectors.txLogs.createAccountAssetsFooBarSelector('exodus_0')(state)).toEqual({
      bitcoin: 'nested-bitcoin-data',
    })

    expect(selectors.txLogs.activeAccountAssetsFooBarSelector(state)).toEqual({
      bitcoin: 'nested-bitcoin-data',
    })
    expect(selectors.txLogs.getAccountAssetsFooBarSelector(state)('exodus_0')).toEqual({
      bitcoin: 'nested-bitcoin-data',
    })
    expect(
      selectors.txLogs.createAssetSourceFooBarSelector({
        walletAccount: 'exodus_0',
        assetName: 'bitcoin',
      })(state)
    ).toEqual('nested-bitcoin-data')

    expect(selectors.txLogs.createActiveAssetSourceFooBarSelector('bitcoin')(state)).toEqual(
      'nested-bitcoin-data'
    )

    expect(
      selectors.txLogs.getAssetSourceFooBarSelector(state)({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
      })
    ).toEqual('nested-bitcoin-data')
    expect(
      selectors.txLogs.getAssetSourceFooBarSelector(state)({
        assetName: 'bitcoin',
      })
    ).toEqual('nested-bitcoin-data')
    expect(
      selectors.txLogs.getAssetSourceFooBarSelector(state)({
        assetName: 'ethereum',
      })
    ).toEqual('nested')
  })
})
