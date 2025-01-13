import { setup } from '../utils'

describe('create', () => {
  it('should return undefined if feature does not exist', () => {
    const { store, selectors } = setup()

    expect(selectors.featureFlags.create('dogemode')(store.getState())).toEqual(undefined)
  })

  it('should return feature flag data', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('featureFlags', { dogemode: { isOn: true } })

    expect(selectors.featureFlags.create('dogemode')(store.getState())).toEqual({ isOn: true })
  })
})
