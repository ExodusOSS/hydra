import { setup } from '../utils.js'

describe('enabled-assets get-is-only-enabled', () => {
  it('return function to check if asset is only enabled asset. if asset combined it should have at least one child enabled', () => {
    const { store, selectors, emitEnabledAssets } = setup()
    emitEnabledAssets({})

    expect(selectors.enabledAssets.getIsOnlyEnabled(store.getState())('bitcoin')).toEqual(false)
    expect(selectors.enabledAssets.getIsOnlyEnabled(store.getState())('_usdcoin')).toEqual(false)

    emitEnabledAssets({
      bitcoin: true,
      usdcoin: true,
      usdcoin_solana: true,
    })

    expect(selectors.enabledAssets.getIsOnlyEnabled(store.getState())('bitcoin')).toEqual(false)
    expect(selectors.enabledAssets.getIsOnlyEnabled(store.getState())('_usdcoin')).toEqual(false)

    emitEnabledAssets({
      usdcoin: true,
    })

    expect(selectors.enabledAssets.getIsOnlyEnabled(store.getState())('bitcoin')).toEqual(false)
    expect(selectors.enabledAssets.getIsOnlyEnabled(store.getState())('_usdcoin')).toEqual(true)

    emitEnabledAssets({
      bitcoin: true,
    })

    expect(selectors.enabledAssets.getIsOnlyEnabled(store.getState())('_usdcoin')).toEqual(false)
    expect(selectors.enabledAssets.getIsOnlyEnabled(store.getState())('bitcoin')).toEqual(true)
  })
})
