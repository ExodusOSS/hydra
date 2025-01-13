import { bitcoin, usdcoin, usdcoinSolana, setup } from '../utils.js'

describe('get', () => {
  it('should return the specified available asset', () => {
    const { store, selectors, emitAvailableAssetNames } = setup()

    emitAvailableAssetNames(new Set([bitcoin.name, usdcoin.name, usdcoinSolana.name]))

    expect(selectors.availableAssets.get(store.getState())(usdcoin.name)).toEqual({
      ...usdcoin,
      combinedAssetNames: [usdcoinSolana.name],
      combinedAssets: [usdcoinSolana],
    })
  })
})
