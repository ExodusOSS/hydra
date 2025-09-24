import { bitcoin, setup, usdcoin, usdcoinSolana } from '../utils.js'

describe('getCombinedFallback', () => {
  it('should return the first combined asset if present', () => {
    const { store, selectors, emitAvailableAssetNames } = setup()

    emitAvailableAssetNames(new Set([bitcoin.name, usdcoin.name, usdcoinSolana.name]))

    expect(selectors.availableAssets.getCombinedFallback(store.getState())(usdcoin.name)).toEqual(
      usdcoinSolana
    )
  })

  it('should return the asset if not combined', () => {
    const { store, selectors, emitAvailableAssetNames } = setup()

    emitAvailableAssetNames(new Set([bitcoin.name, usdcoin.name, usdcoinSolana.name]))

    expect(selectors.availableAssets.getCombinedFallback(store.getState())(bitcoin.name)).toEqual(
      bitcoin
    )
  })
})
