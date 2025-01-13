import { setup } from '../utils.js'

describe('value', () => {
  it('should return undefined when not loaded', () => {
    const { store, selectors } = setup()

    expect(selectors.startupCounter.value(store.getState())).toEqual(undefined)
  })

  it('should return count when loaded', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('startupCount', 10)

    expect(selectors.startupCounter.value(store.getState())).toEqual(10)
  })
})
