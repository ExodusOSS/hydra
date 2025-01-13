import { setup } from '../utils.js'

describe('enabled-assets create-is-only-enabled', () => {
  it('return function to check if asset is only enabled asset. if asset combined it should have at least one child enabled', () => {
    const { store, selectors, emitEnabledAssets } = setup()
    emitEnabledAssets({})

    expect(selectors.enabledAssets.createIsOnlyEnabled('bitcoin')(store.getState())).toEqual(false)
    expect(selectors.enabledAssets.createIsOnlyEnabled('_usdcoin')(store.getState())).toEqual(false)

    emitEnabledAssets({
      bitcoin: true,
      usdcoin: true,
      usdcoin_solana: true,
    })

    expect(selectors.enabledAssets.createIsOnlyEnabled('bitcoin')(store.getState())).toEqual(false)
    expect(selectors.enabledAssets.createIsOnlyEnabled('_usdcoin')(store.getState())).toEqual(false)

    emitEnabledAssets({
      usdcoin: true,
    })

    expect(selectors.enabledAssets.createIsOnlyEnabled('bitcoin')(store.getState())).toEqual(false)
    expect(selectors.enabledAssets.createIsOnlyEnabled('_usdcoin')(store.getState())).toEqual(true)

    emitEnabledAssets({
      bitcoin: true,
    })

    expect(selectors.enabledAssets.createIsOnlyEnabled('bitcoin')(store.getState())).toEqual(true)
    expect(selectors.enabledAssets.createIsOnlyEnabled('_usdcoin')(store.getState())).toEqual(false)
  })
})
