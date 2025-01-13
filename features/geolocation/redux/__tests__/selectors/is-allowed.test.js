import { setup } from '../utils'

describe('is-allowed', () => {
  it('should return false by default', () => {
    const { store, selectors } = setup()

    expect(selectors.geolocation.isAllowed(store.getState())).toEqual(false)
  })

  it('should return false if emitted', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('geolocation', { isAllowed: false })

    expect(selectors.geolocation.isAllowed(store.getState())).toEqual(false)
  })

  it('should return true if emitted', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('geolocation', { isAllowed: true })

    expect(selectors.geolocation.isAllowed(store.getState())).toEqual(true)
  })
})
