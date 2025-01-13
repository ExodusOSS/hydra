import { setup } from '../utils'

describe('getIsOn', () => {
  it('should return false if feature does not exist', () => {
    const { store, selectors } = setup()

    expect(selectors.featureFlags.createIsOn('dogemode')(store.getState())).toEqual(false)
  })

  it('should return feature flag on data', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('featureFlags', { dogemode: { isOn: true } })

    expect(selectors.featureFlags.createIsOn('dogemode')(store.getState())).toEqual(true)
  })
})
