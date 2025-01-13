import { bitcoin, ethereum, usdcoinSolana, usdcoinFtx, setup } from '../utils.js'

describe('isAssetWithNetworkIcon', () => {
  test('should return false for asset without network icon', () => {
    const { store, selectors, emitAvailableAssetNames } = setup()

    emitAvailableAssetNames(new Set([bitcoin.name, ethereum.name]))

    expect(
      selectors.availableAssets.getIsAssetWithNetworkIcon({
        assetName: bitcoin.name,
        hasIcon: false,
      })(store.getState())
    ).toBeFalsy()
  })

  test('should return false for multi network asset', () => {
    const { store, selectors, emitAvailableAssetNames } = setup()

    emitAvailableAssetNames(new Set([ethereum.name]))

    expect(
      selectors.availableAssets.getIsAssetWithNetworkIcon({
        assetName: ethereum.name,
        hasIcon: true,
      })(store.getState())
    ).toBeFalsy()
  })

  test('should return true if asset is a token', () => {
    const { store, selectors, emitAvailableAssetNames } = setup()

    emitAvailableAssetNames(new Set([usdcoinSolana.name]))

    expect(
      selectors.availableAssets.getIsAssetWithNetworkIcon({
        assetName: usdcoinSolana.name,
        hasIcon: true,
      })(store.getState())
    ).toBeTruthy()
  })

  test('should return false if asset has assets on other chains', () => {
    const { store, selectors, emitAvailableAssetNames } = setup()

    emitAvailableAssetNames(new Set([usdcoinFtx.name]))

    expect(
      selectors.availableAssets.getIsAssetWithNetworkIcon({
        assetName: usdcoinFtx.name,
        hasIcon: true,
      })(store.getState())
    ).toBeFalsy()
  })
})
