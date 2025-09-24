import { bitcoin, setup, usdcoin, usdcoinSolana } from '../utils.js'

describe('allWithParentCombinedNetwork', () => {
  it('should combine assets that are a multi network asset', () => {
    const { store, selectors, emitAvailableAssetNames } = setup()

    emitAvailableAssetNames(new Set([bitcoin.name, usdcoin.name, usdcoinSolana.name]))

    expect(selectors.availableAssets.allWithParentCombinedNetwork(store.getState())).toEqual([
      bitcoin,
      {
        ...usdcoin,
        combinedAssetNames: [usdcoinSolana.name],
        combinedAssets: [usdcoinSolana],
      },
    ])
  })
})
