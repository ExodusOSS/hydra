import { setup } from '../utils.js'

describe('enabled-assets create-is-enabled', () => {
  it('should return function to check asset enabled', () => {
    const { store, selectors, emitEnabledAssets } = setup()

    expect(selectors.enabledAssets.createIsEnabled('bitcoin')(store.getState())).toEqual(false)

    const enabled = {
      bitcoin: true,
      ethereum: true,
    }

    emitEnabledAssets(enabled)

    expect(selectors.enabledAssets.createIsEnabled('bitcoin')(store.getState())).toEqual(true)
  })
})
