import config from '../../../default-config.js'
import { setup } from '../utils.js'

describe('balances selectors', () => {
  test('resolved selectors', () => {
    const { selectors } = setup({})

    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
    }

    const getSelectors = config.balanceFields.map((field) => `get${capitalizeFirstLetter(field)}`)
    const createSelectors = config.balanceFields.map(
      (field) => `create${capitalizeFirstLetter(field)}`
    )

    expect(Object.keys(selectors.balances).sort()).toEqual(
      [
        'createAssetSourceSelector',
        'createAssetSourceSelectorOld',
        'createBaseAssetSourceSelector',
        'createBaseAssetSourceSelectorOld',
        'createActiveAssetSourceSelectorOld',
        'createActiveAssetSourceSelector',
        'createActiveBaseAssetSourceSelector',
        'createIsWalletAccountLoadingSelectorOld',
        'createIsWalletAccountLoadingSelector',
        'createIsWalletAccountLoadedSelectorOld',
        'createIsWalletAccountLoadedSelector',
        'isActiveWalletAccountLoading',
        'isActiveWalletAccountLoaded',
        'createAccountAssetsSelector',
        'activeAccountAssetsSelector',
        'getAccountAssetsSelector',
        'createAccountAssetsBalanceSelector',
        'activeAccountAssetsBalanceSelector',
        'getAccountAssetsBalanceSelector',
        'createAssetSourceBalanceSelector',
        'createActiveAssetSourceBalanceSelector',
        'getAssetSourceBalanceSelector',
        'byAsset',
        'getBalanceForField',
        'createUnconfirmedBalance',
        'getUnconfirmedBalance',
        ...getSelectors,
        ...createSelectors,
        'getBalances',
        'hasBalance',
        'exodus_0',
        'createFuelThreshold',
        'createRequiresFuelThreshold',
      ].sort()
    )
  })
})
