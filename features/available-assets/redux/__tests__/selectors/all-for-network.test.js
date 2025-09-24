import { bitcoin, setup, usdcoin, usdcoinSolana } from '../utils.js'

describe('allForNetwork', () => {
  it('should return assets for a network', () => {
    const { store, selectors, emitAvailableAssetNames } = setup()

    emitAvailableAssetNames(new Set([bitcoin.name, usdcoin.name, usdcoinSolana.name]))

    expect(selectors.availableAssets.allForNetwork(store.getState())(usdcoin.name)).toEqual({
      [usdcoin.name]: {
        ...usdcoin,
        combinedAssets: [usdcoinSolana],
        combinedAssetNames: [usdcoinSolana.name],
      },
    })
  })
})
