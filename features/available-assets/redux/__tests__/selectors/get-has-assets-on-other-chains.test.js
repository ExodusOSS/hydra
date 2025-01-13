import { bitcoin, usdcoin, usdcoinSolana, usdcoinAlgorand, setup } from '../utils.js'

describe('getHasAssetsOnOtherChains', () => {
  it('should return true if there are related assets on other chains', () => {
    const { store, selectors, emitAvailableAssetNames } = setup()

    emitAvailableAssetNames(
      new Set([bitcoin.name, usdcoin.name, usdcoinSolana.name, usdcoinAlgorand.name])
    )

    expect(
      selectors.availableAssets.getHasAssetsOnOtherChains(store.getState())(usdcoin.name)
    ).toBeTruthy()
  })

  it('should return false if no assets are on other chains', () => {
    const { store, selectors, emitAvailableAssetNames } = setup()

    emitAvailableAssetNames(
      new Set([bitcoin.name, usdcoin.name, usdcoinSolana.name, usdcoinAlgorand.name])
    )

    expect(
      selectors.availableAssets.getHasAssetsOnOtherChains(store.getState())(bitcoin.name)
    ).toBeFalsy()
  })
})
