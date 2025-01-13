import { setup } from '../utils'

describe('loaded', () => {
  it('should return false by default', () => {
    const { store, selectors } = setup()

    expect(selectors.geolocation.loaded(store.getState())).toEqual(false)
  })

  it('should return true when data loaded', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('geolocation', { countryCode: 'UY', countryName: 'Uruguay' })

    expect(selectors.geolocation.loaded(store.getState())).toEqual(true)
  })
})
