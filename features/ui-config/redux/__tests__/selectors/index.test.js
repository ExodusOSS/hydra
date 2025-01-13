import { setup } from '../utils.js'

describe('nextIndex', () => {
  it('should return the next index for wallet accounts that have the default source', () => {
    const { store, selectors, emitAssetsShowPriceMap } = setup()

    expect(selectors.uiConfig.assetsShowPriceMap(store.getState())).toEqual(undefined)

    emitAssetsShowPriceMap(true)

    expect(selectors.uiConfig.assetsShowPriceMap(store.getState())).toEqual(true)
  })
})
