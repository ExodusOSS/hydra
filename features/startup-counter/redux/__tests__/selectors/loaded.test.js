import { setup } from '../utils.js'

describe('loaded', () => {
  it('should return false when not loaded', () => {
    const { store, selectors } = setup()

    expect(selectors.startupCounter.loaded(store.getState())).toEqual(false)
  })

  it('should return count when loaded', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('startupCount', 10)

    expect(selectors.startupCounter.loaded(store.getState())).toEqual(true)
  })
})
