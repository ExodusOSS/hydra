import { bitcoin, ethereum, setup, usdcoin, usdcoinSolana } from '../utils.js'

describe('all', () => {
  it('should return all available assets', () => {
    const { store, selectors, emitAvailableAssetNames } = setup()

    emitAvailableAssetNames(new Set([bitcoin.name, ethereum.name]))

    expect(selectors.availableAssets.all(store.getState())).toEqual({
      [bitcoin.name]: bitcoin,
      [ethereum.name]: ethereum,
    })
  })

  it('should return combined assets', () => {
    const { store, selectors, emitAvailableAssetNames } = setup()

    emitAvailableAssetNames(new Set([bitcoin.name, usdcoin.name, usdcoinSolana.name]))

    expect(selectors.availableAssets.all(store.getState())).toEqual({
      [bitcoin.name]: bitcoin,
      [usdcoin.name]: {
        ...usdcoin,
        combinedAssets: [usdcoinSolana],
        combinedAssetNames: [usdcoinSolana.name],
      },
      [usdcoinSolana]: usdcoinSolana,
    })
  })
})
