import {
  bitcoin,
  usdcoin,
  usdcoinSolana,
  usdcoinAlgorand,
  usdcoinEthereum,
  setup,
} from '../utils.js'

describe('getParentCombinedSelector', () => {
  it('should return parent combined asset', () => {
    const { store, selectors, emitAvailableAssetNames } = setup()

    emitAvailableAssetNames(
      new Set([
        bitcoin.name,
        usdcoin.name,
        usdcoinSolana.name,
        usdcoinAlgorand.name,
        usdcoinEthereum.name,
      ])
    )

    expect(
      selectors.availableAssets.getParentCombined(store.getState())(usdcoinEthereum.name).name
    ).toEqual('_usdcoin')
  })

  it('return undefined for non combined', () => {
    const { store, selectors, emitAvailableAssetNames } = setup()

    emitAvailableAssetNames(
      new Set([bitcoin.name, usdcoin.name, usdcoinSolana.name, usdcoinAlgorand.name])
    )

    expect(selectors.availableAssets.getParentCombined(store.getState())(bitcoin.name)).toEqual()
  })
})
