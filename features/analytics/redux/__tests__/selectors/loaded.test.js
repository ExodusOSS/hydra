import { setup } from '../utils'

describe('loaded', () => {
  it('should return false by default', () => {
    const { store, selectors } = setup()

    expect(selectors.analytics.loaded(store.getState())).toEqual(false)
  })

  it('should return current data', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('shareActivity', false)

    expect(selectors.analytics.loaded(store.getState())).toEqual(true)
  })
})
