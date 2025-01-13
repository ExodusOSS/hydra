import { setup } from '../utils.js'

describe('enabled-assets loading', () => {
  it('should return actual loading state', () => {
    const { store, selectors, emitEnabledAssets } = setup()

    const enabled = {
      bitcoin: true,
      ethereum: true,
    }

    expect(selectors.enabledAssets.loading(store.getState())).toEqual(true)

    emitEnabledAssets({
      enabled,
    })

    expect(selectors.enabledAssets.loading(store.getState())).toEqual(false)
  })
})
