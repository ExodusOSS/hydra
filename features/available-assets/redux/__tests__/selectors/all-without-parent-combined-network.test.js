import { bitcoin, ethereum, usdcoin, setup } from '../utils.js'

describe('allWithoutParentCombinedNetwork', () => {
  it('should return assets that are not combined', () => {
    const { store, selectors, emitAvailableAssetNames } = setup()

    emitAvailableAssetNames(new Set([bitcoin.name, ethereum.name, usdcoin.name]))

    expect(selectors.availableAssets.allWithoutParentCombinedNetwork(store.getState())).toEqual([
      bitcoin,
      ethereum,
    ])
  })
})
