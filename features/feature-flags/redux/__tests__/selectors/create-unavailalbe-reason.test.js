import { setup } from '../utils.js'

describe('getUnavailableReason', () => {
  it('should return undefined if feature is not disabled', () => {
    const { store, selectors } = setup()

    expect(selectors.featureFlags.createUnavailableReason('dogemode')(store.getState())).toEqual(
      undefined
    )
  })

  it('should return module for which feature is disabled', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('featureFlags', { dogemode: { unavailableReason: 'geolocation' } })

    expect(selectors.featureFlags.createUnavailableReason('dogemode')(store.getState())).toEqual(
      'geolocation'
    )
  })
})
