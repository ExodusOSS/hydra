import { bitcoin, usdcoin, usdcoinSolana, setup } from '../utils.js'

describe('createCombinedChildrenNames', () => {
  it('should return children names of combined assets', () => {
    const { store, selectors, emitAvailableAssetNames } = setup()

    emitAvailableAssetNames(new Set([bitcoin.name, usdcoin.name, usdcoinSolana.name]))

    expect(
      selectors.availableAssets.createCombinedChildrenNames(usdcoin.name)(store.getState())
    ).toEqual([usdcoinSolana.name])
  })

  it('should return name of the asset if not combined', () => {
    const { store, selectors, emitAvailableAssetNames } = setup()

    emitAvailableAssetNames(new Set([bitcoin.name, usdcoin.name]))

    expect(
      selectors.availableAssets.createCombinedChildrenNames(bitcoin.name)(store.getState())
    ).toEqual([bitcoin.name])
  })
})
