import { setup } from '../utils.js'

describe('enabled-assets get-is-enabled', () => {
  it('should return function to check asset enabled', () => {
    const { store, selectors, emitEnabledAssets } = setup()

    expect(selectors.enabledAssets.getIsEnabled(store.getState())('bitcoin')).toEqual(false)

    emitEnabledAssets({
      bitcoin: true,
      ethereum: true,
    })

    expect(selectors.enabledAssets.getIsEnabled(store.getState())('bitcoin')).toEqual(true)
  })
})
